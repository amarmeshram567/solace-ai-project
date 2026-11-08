import { prisma } from '../database/prisma.js';
import { localYmd } from '../utils/dates.js';
import { awardXp, REWARDS, touchStreak } from './gamification.service.js';
import { getUserTimezone } from './user.service.js';

const serialize = (s) => ({
  id: s.id,
  patternId: s.patternId,
  pattern: s.pattern,
  cycles: s.cycles,
  durationSec: s.durationSec,
  completed: s.completed,
  completedAt: s.completedAt.toISOString(),
});

export async function recordBreathingSession(userId, input) {
  const existing = await prisma.breathingSession.findUnique({
    where: { userId_clientRequestId: { userId, clientRequestId: input.clientRequestId } },
  });
  if (existing) return { session: serialize(existing), reward: { awarded: false, amount: 0 } };

  const today = localYmd(await getUserTimezone(userId));

  const { session, reward } = await prisma.$transaction(async (tx) => {
    const session = await tx.breathingSession.create({
      data: {
        userId,
        clientRequestId: input.clientRequestId,
        patternId: input.patternId,
        pattern: input.pattern,
        cycles: input.cycles,
        durationSec: input.durationSec,
        completed: input.completed,
      },
    });
    // XP only for completed sessions, once per session.
    let reward = { awarded: false, amount: 0, leveledUp: false };
    if (input.completed) {
      reward = await awardXp(tx, userId, 'BREATHING_SESSION', REWARDS.BREATHING_SESSION, `breathing:${input.clientRequestId}`);
      await touchStreak(tx, userId, today);
    }
    return { session, reward };
  });

  return { session: serialize(session), reward: { awarded: reward.awarded, amount: reward.amount, leveledUp: reward.leveledUp } };
}

export async function listBreathingSessions(userId, limit = 20) {
  const rows = await prisma.breathingSession.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });
  return rows.map(serialize);
}

export async function breathingStatistics(userId) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [total, completed, last7, seconds] = await Promise.all([
    prisma.breathingSession.count({ where: { userId } }),
    prisma.breathingSession.count({ where: { userId, completed: true } }),
    prisma.breathingSession.count({ where: { userId, completed: true, completedAt: { gte: since } } }),
    prisma.breathingSession.aggregate({ where: { userId, completed: true }, _sum: { durationSec: true } }),
  ]);
  return {
    totalSessions: total,
    completedSessions: completed,
    completedLast7Days: last7,
    totalMinutes: Math.round((seconds._sum.durationSec ?? 0) / 60),
  };
}

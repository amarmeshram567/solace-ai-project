import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { addDays, localYmd } from '../utils/dates.js';
import { MOODS } from '../content/moods.js';
import { awardXp, REWARDS, touchStreak } from './gamification.service.js';
import { getUserTimezone } from './user.service.js';

const entryInclude = { tags: true };

const serialize = (e) => ({
  id: e.id,
  mood: e.mood,
  moodLabel: MOODS[e.mood]?.label ?? e.mood,
  intensity: e.intensity,
  note: e.note,
  tags: e.tags.map((t) => t.tag).sort(),
  recordedAt: e.recordedAt.toISOString(),
});

const reflectionFor = (mood) => ({
  reflection: MOODS[mood]?.response ?? '',
  suggestion: MOODS[mood]?.suggestion ?? null,
});

async function findByClientRequest(userId, clientRequestId) {
  return prisma.moodEntry.findUnique({
    where: { userId_clientRequestId: { userId, clientRequestId } },
    include: entryInclude,
  });
}

export async function createMoodEntry(userId, input) {
  // A retry with the same clientRequestId returns the original entry, with no new reward.
  const dup = await findByClientRequest(userId, input.clientRequestId);
  if (dup) {
    return { entry: serialize(dup), ...reflectionFor(dup.mood), reward: { awarded: false, amount: 0 } };
  }

  const today = localYmd(await getUserTimezone(userId));

  let created;
  try {
    created = await prisma.$transaction(async (tx) => {
      const entry = await tx.moodEntry.create({
        data: {
          userId,
          mood: input.mood,
          intensity: input.intensity ?? null,
          note: input.note ?? null,
          clientRequestId: input.clientRequestId,
          tags: { create: (input.tags ?? []).map((tag) => ({ tag })) },
        },
        include: entryInclude,
      });
      const reward = await awardXp(tx, userId, 'MOOD_CHECKIN', REWARDS.MOOD_CHECKIN, `mood:${today}`);
      await touchStreak(tx, userId, today);
      return { entry, reward };
    });
  } catch (err) {
    // Two identical requests raced: the loser sees the unique constraint.
    if (err?.code === 'P2002') {
      const raced = await findByClientRequest(userId, input.clientRequestId);
      if (raced) return { entry: serialize(raced), ...reflectionFor(raced.mood), reward: { awarded: false, amount: 0 } };
    }
    throw err;
  }

  return {
    entry: serialize(created.entry),
    ...reflectionFor(input.mood),
    reward: { awarded: created.reward.awarded, amount: created.reward.amount, totalXp: created.reward.totalXp, leveledUp: created.reward.leveledUp, levelName: created.reward.levelName },
  };
}

export async function listMoodEntries(userId, { limit, before }) {
  const rows = await prisma.moodEntry.findMany({
    where: { userId, ...(before ? { recordedAt: { lt: new Date(before) } } : {}) },
    orderBy: { recordedAt: 'desc' },
    take: limit + 1,
    include: entryInclude,
  });
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map(serialize);
  return { items, nextCursor: hasMore ? items[items.length - 1].recordedAt : null };
}

export async function getMoodEntry(userId, id) {
  const row = await prisma.moodEntry.findFirst({ where: { id, userId }, include: entryInclude });
  if (!row) throw new AppError(404, 'NOT_FOUND', 'That mood entry could not be found');
  return serialize(row);
}

export async function updateMoodEntry(userId, id, patch) {
  await getMoodEntry(userId, id);
  const data = {};
  if (patch.mood !== undefined) data.mood = patch.mood;
  if (patch.intensity !== undefined) data.intensity = patch.intensity;
  if (patch.note !== undefined) data.note = patch.note;

  const updated = await prisma.$transaction(async (tx) => {
    if (patch.tags !== undefined) {
      await tx.moodTag.deleteMany({ where: { moodEntryId: id } });
      await tx.moodTag.createMany({ data: patch.tags.map((tag) => ({ moodEntryId: id, tag })) });
    }
    return tx.moodEntry.update({ where: { id }, data, include: entryInclude });
  });
  return serialize(updated);
}

export async function deleteMoodEntry(userId, id) {
  const { count } = await prisma.moodEntry.deleteMany({ where: { id, userId } });
  if (count === 0) throw new AppError(404, 'NOT_FOUND', 'That mood entry could not be found');
}

export async function moodAnalytics(userId, range) {
  const days = range === 'month' ? 30 : 7;
  const tz = await getUserTimezone(userId);
  const today = localYmd(tz);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.moodEntry.findMany({
    where: { userId, recordedAt: { gte: since } },
    select: { mood: true, intensity: true, recordedAt: true },
  });

  const byMood = {};
  const perDay = new Map();
  for (let i = days - 1; i >= 0; i--) perDay.set(addDays(today, -i), { date: addDays(today, -i), count: 0, intensitySum: 0, intensityN: 0 });

  for (const r of rows) {
    byMood[r.mood] = (byMood[r.mood] ?? 0) + 1;
    const day = perDay.get(localYmd(tz, r.recordedAt));
    if (day) {
      day.count += 1;
      if (r.intensity) {
        day.intensitySum += r.intensity;
        day.intensityN += 1;
      }
    }
  }

  return {
    range: days === 30 ? 'month' : 'week',
    days,
    totalEntries: rows.length,
    byMood,
    byDay: [...perDay.values()].map((d) => ({
      date: d.date,
      count: d.count,
      avgIntensity: d.intensityN ? Math.round((d.intensitySum / d.intensityN) * 10) / 10 : null,
    })),
  };
}

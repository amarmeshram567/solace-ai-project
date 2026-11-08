import { addDays, dbDateToYmd, ymdToDbDate } from '../utils/dates.js';
import { describeXp } from '../utils/levels.js';

// Reward values from the specification. Every award is keyed by a deterministic
// sourceKey, so retries and repeated submissions cannot award XP twice.
export const REWARDS = {
  MOOD_CHECKIN: 10,
  BREATHING_SESSION: 15,
  WELLNESS_ACTIVITY: 20,
  ASSESSMENT_COMPLETED: 15,
  DAILY_REFLECTION: 10,
  JOURNALING: 10,
};

/**
 * Awards XP inside an existing Prisma transaction (`tx`).
 * Returns { awarded, amount, totalXp, level, levelName, leveledUp }.
 */
export async function awardXp(tx, userId, reason, amount, sourceKey) {
  const existing = await tx.xpTransaction.findUnique({
    where: { userId_sourceKey: { userId, sourceKey } },
  });
  if (existing) {
    return { awarded: false, amount: 0, totalXp: null, level: null, levelName: null, leveledUp: false };
  }

  await tx.xpTransaction.create({ data: { userId, amount, reason, sourceKey } });

  const level = await tx.userLevel.upsert({
    where: { userId },
    update: { totalXp: { increment: amount } },
    create: { userId, totalXp: amount },
  });

  const now = describeXp(level.totalXp);
  const before = describeXp(level.totalXp - amount);
  if (now.level !== level.level) {
    await tx.userLevel.update({ where: { userId }, data: { level: now.level } });
  }

  return {
    awarded: true,
    amount,
    totalXp: level.totalXp,
    level: now.level,
    levelName: now.levelName,
    leveledUp: now.level > before.level,
  };
}

/**
 * Records that the user was active on `today` (their local date).
 * Consecutive days extend the streak; a missed day restarts it at 1.
 * Repeated calls on the same day are no-ops.
 */
export async function touchStreak(tx, userId, today) {
  const streak = await tx.userStreak.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const last = streak.lastActiveDate ? dbDateToYmd(streak.lastActiveDate) : null;
  if (last === today) return streak;

  const continues = last === addDays(today, -1);
  const currentDays = continues ? streak.currentDays + 1 : 1;

  return tx.userStreak.update({
    where: { userId },
    data: {
      currentDays,
      longestDays: Math.max(streak.longestDays, currentDays),
      lastActiveDate: ymdToDbDate(today),
    },
  });
}

// A streak only counts if the last active day was today or yesterday in the user's timezone.
export function effectiveStreak(streak, today) {
  if (!streak?.lastActiveDate) return 0;
  const last = dbDateToYmd(streak.lastActiveDate);
  return last === today || last === addDays(today, -1) ? streak.currentDays : 0;
}

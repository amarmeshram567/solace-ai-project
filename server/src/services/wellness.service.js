import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { localYmd, ymdToDbDate } from '../utils/dates.js';
import { awardXp, REWARDS, touchStreak } from './gamification.service.js';
import { getUserTimezone } from './user.service.js';

export async function listResources() {
  const rows = await prisma.wellnessResource.findMany({ orderBy: { title: 'asc' }, select: { id: true, slug: true, title: true, summary: true } });
  return rows;
}

export async function getResource(id) {
  const row = await prisma.wellnessResource.findUnique({ where: { id } });
  if (!row) throw new AppError(404, 'NOT_FOUND', 'That resource could not be found');
  return { id: row.id, slug: row.slug, title: row.title, summary: row.summary, sections: row.sections };
}

export async function listActivities(category) {
  const rows = await prisma.wellnessActivity.findMany({
    where: category ? { category } : undefined,
    orderBy: { title: 'asc' },
    select: { id: true, slug: true, title: true, description: true, category: true, durationSec: true, xpReward: true },
  });
  return rows;
}

export async function getActivity(id) {
  const row = await prisma.wellnessActivity.findUnique({ where: { id } });
  if (!row) throw new AppError(404, 'NOT_FOUND', 'That activity could not be found');
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    durationSec: row.durationSec,
    xpReward: row.xpReward,
    steps: row.steps,
  };
}

export async function completeActivity(userId, activityId) {
  const activity = await prisma.wellnessActivity.findUnique({ where: { id: activityId } });
  if (!activity) throw new AppError(404, 'NOT_FOUND', 'That activity could not be found');

  const today = localYmd(await getUserTimezone(userId));
  const completedOn = ymdToDbDate(today);

  const already = await prisma.activityCompletion.findUnique({
    where: { userId_activityId_completedOn: { userId, activityId, completedOn } },
  });
  if (already) return { completed: true, alreadyCompletedToday: true, reward: { awarded: false, amount: 0 } };

  const reward = await prisma.$transaction(async (tx) => {
    await tx.activityCompletion.create({ data: { userId, activityId, completedOn } });
    const r = await awardXp(tx, userId, 'WELLNESS_ACTIVITY', activity.xpReward ?? REWARDS.WELLNESS_ACTIVITY, `activity:${activityId}:${today}`);
    await touchStreak(tx, userId, today);
    return r;
  });

  return {
    completed: true,
    alreadyCompletedToday: false,
    reward: { awarded: reward.awarded, amount: reward.amount, leveledUp: reward.leveledUp },
  };
}

import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { localYmd } from '../utils/dates.js';
import { effectiveStreak } from './gamification.service.js';
import { describeXp } from '../utils/levels.js';
import { getDailyAffirmation } from './affirmation.service.js';

export async function getHome(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, level: true, streak: true },
  });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');

  const timezone = user.profile?.timezone ?? 'Asia/Kolkata';
  const today = localYmd(timezone);

  return {
    user: { name: user.profile?.displayName ?? '', timezone },
    date: today,
    level: describeXp(user.level?.totalXp ?? 0),
    streak: {
      current: effectiveStreak(user.streak, today),
      longest: user.streak?.longestDays ?? 0,
    },
    affirmation: await getDailyAffirmation(userId),
  };
}

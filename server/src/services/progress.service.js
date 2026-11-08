import { prisma } from '../database/prisma.js';
import { addDays, localYmd, startOfLocalDay } from '../utils/dates.js';
import { describeXp, LEVELS } from '../utils/levels.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { MOODS } from '../content/moods.js';
import { effectiveStreak } from './gamification.service.js';
import { assessmentHistory } from './assessment.service.js';
import { getUserTimezone } from './user.service.js';

// Counts every figure the dashboard needs in parallel. Everything comes from stored
// records; nothing is estimated or filled in.
async function gather(userId, since) {
  const [user, moods, breathingInRange, activitiesInRange, moodTotal, breathingTotal, activityTotal, assessmentTotal] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { level: true, streak: true } }),
      prisma.moodEntry.findMany({
        where: { userId, recordedAt: { gte: since } },
        select: { mood: true, intensity: true, recordedAt: true },
      }),
      prisma.breathingSession.count({ where: { userId, completed: true, completedAt: { gte: since } } }),
      prisma.activityCompletion.count({ where: { userId, completedAt: { gte: since } } }),
      prisma.moodEntry.count({ where: { userId } }),
      prisma.breathingSession.count({ where: { userId, completed: true } }),
      prisma.activityCompletion.count({ where: { userId } }),
      prisma.assessmentResult.count({ where: { userId } }),
    ]);

  return {
    user,
    moods,
    breathingInRange,
    activitiesInRange,
    totals: {
      moodEntries: moodTotal,
      breathingCompleted: breathingTotal,
      activitiesCompleted: activityTotal,
      assessments: assessmentTotal,
    },
  };
}

export async function getProgress(userId, range) {
  const days = range === 'month' ? 30 : 7;
  const tz = await getUserTimezone(userId);
  const today = localYmd(tz);
  const startDate = addDays(today, -(days - 1));
  const since = startOfLocalDay(tz, startDate);
  const { user, moods, breathingInRange, activitiesInRange, totals } = await gather(userId, since);

  const level = describeXp(user?.level?.totalXp ?? 0);
  const streakCurrent = effectiveStreak(user?.streak, today);
  const streakLongest = user?.streak?.longestDays ?? 0;

  const byMood = {};
  const perDay = new Map();
  for (let i = 0; i < days; i += 1) {
    const ymd = addDays(startDate, i);
    perDay.set(ymd, { date: ymd, count: 0, intensitySum: 0, intensityN: 0 });
  }
  for (const m of moods) {
    byMood[m.mood] = (byMood[m.mood] ?? 0) + 1;
    const d = perDay.get(localYmd(tz, m.recordedAt));
    if (d) {
      d.count += 1;
      if (m.intensity) {
        d.intensitySum += m.intensity;
        d.intensityN += 1;
      }
    }
  }

  const recentAssessments = (await assessmentHistory(userId)).slice(0, 5);
  const achievements = achievementsFrom({ totalXp: level.totalXp, longestStreak: streakLongest, ...totals });
  const isEmpty =
    totals.moodEntries === 0 &&
    totals.breathingCompleted === 0 &&
    totals.activitiesCompleted === 0 &&
    totals.assessments === 0 &&
    level.totalXp === 0;

  return {
    range: days === 30 ? 'month' : 'week',
    isEmpty,
    level,
    levels: LEVELS.map((l) => ({ level: l.level, name: l.name, minXp: l.minXp })),
    streak: { current: streakCurrent, longest: streakLongest },
    totals: { ...totals, totalXp: level.totalXp },
    inRange: {
      days,
      breathingSessions: breathingInRange,
      activitiesCompleted: activitiesInRange,
      moodEntries: moods.length,
    },
    moodDistribution: Object.entries(byMood).map(([mood, count]) => ({
      mood,
      label: MOODS[mood]?.label ?? mood,
      count,
    })),
    moodTrend: [...perDay.values()].map((d) => ({
      date: d.date,
      count: d.count,
      avgIntensity: d.intensityN ? Math.round((d.intensitySum / d.intensityN) * 10) / 10 : null,
    })),
    recentAssessments,
    achievements,
  };
}

export async function getXpSummary(userId) {
  const [level, transactions] = await Promise.all([
    prisma.userLevel.findUnique({ where: { userId } }),
    prisma.xpTransaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);
  return {
    ...describeXp(level?.totalXp ?? 0),
    recent: transactions.map((t) => ({
      amount: t.amount,
      reason: t.reason,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

export async function getStreaks(userId) {
  const [user, tz] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { streak: true } }),
    getUserTimezone(userId),
  ]);
  const streak = user?.streak;
  return {
    current: effectiveStreak(streak, localYmd(tz)),
    longest: streak?.longestDays ?? 0,
    lastActiveDate: streak?.lastActiveDate ? streak.lastActiveDate.toISOString().slice(0, 10) : null,
  };
}

export async function getAchievements(userId) {
  const tz = await getUserTimezone(userId);
  const { user, totals } = await gather(userId, startOfLocalDay(tz, localYmd(tz)));
  return achievementsFrom({
    totalXp: user?.level?.totalXp ?? 0,
    longestStreak: user?.streak?.longestDays ?? 0,
    ...totals,
  });
}

// Pure function: maps the metric values onto the milestone list.
function achievementsFrom(values) {
  return ACHIEVEMENTS.map((a) => {
    const value = values[a.metric] ?? 0;
    return {
      key: a.key,
      title: a.title,
      description: a.description,
      progress: Math.min(value, a.target),
      target: a.target,
      unlocked: value >= a.target,
    };
  });
}

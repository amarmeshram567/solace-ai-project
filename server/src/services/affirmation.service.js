import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { addDays, localYmd, ymdToDbDate } from '../utils/dates.js';
import { getUserTimezone } from './user.service.js';

// Avoid repeating an affirmation the user has seen within this many days.
const RECENT_WINDOW_DAYS = 14;

const present = (row) => ({
  id: row.affirmation.id,
  text: row.affirmation.text,
  saved: row.saved,
});

async function todayFor(userId) {
  const tz = await getUserTimezone(userId);
  return ymdToDbDate(localYmd(tz));
}

async function pickFor(userId, excludeId) {
  const since = ymdToDbDate(addDays(localYmd(await getUserTimezone(userId)), -RECENT_WINDOW_DAYS));
  const [active, recent] = await Promise.all([
    prisma.affirmation.findMany({ where: { isActive: true }, select: { id: true, text: true } }),
    prisma.userAffirmation.findMany({
      where: { userId, shownOn: { gte: since } },
      select: { affirmationId: true },
    }),
  ]);

  if (active.length === 0) {
    throw new AppError(503, 'NO_AFFIRMATIONS', 'Affirmations are not available yet.');
  }

  const recentIds = new Set(recent.map((r) => r.affirmationId));
  const fresh = active.filter((a) => a.id !== excludeId && !recentIds.has(a.id));
  const pool = fresh.length > 0 ? fresh : active.filter((a) => a.id !== excludeId);
  const choices = pool.length > 0 ? pool : active;
  return choices[Math.floor(Math.random() * choices.length)];
}

// Exactly one affirmation per user per local day. Retries are safe because of the
// unique (userId, shownOn) constraint.
export async function getDailyAffirmation(userId) {
  const shownOn = await todayFor(userId);

  const existing = await prisma.userAffirmation.findUnique({
    where: { userId_shownOn: { userId, shownOn } },
    include: { affirmation: true },
  });
  if (existing) return present(existing);

  const pick = await pickFor(userId, null);
  try {
    const row = await prisma.userAffirmation.create({
      data: { userId, affirmationId: pick.id, shownOn },
      include: { affirmation: true },
    });
    return present(row);
  } catch (err) {
    if (err?.code === 'P2002') return getDailyAffirmation(userId);
    throw err;
  }
}

export async function refreshDailyAffirmation(userId) {
  const current = await getDailyAffirmation(userId);
  const shownOn = await todayFor(userId);
  const pick = await pickFor(userId, current.id);

  const row = await prisma.userAffirmation.update({
    where: { userId_shownOn: { userId, shownOn } },
    data: { affirmationId: pick.id, saved: false },
    include: { affirmation: true },
  });
  return present(row);
}

export async function setDailyAffirmationSaved(userId, saved) {
  await getDailyAffirmation(userId);
  const shownOn = await todayFor(userId);
  const row = await prisma.userAffirmation.update({
    where: { userId_shownOn: { userId, shownOn } },
    data: { saved },
    include: { affirmation: true },
  });
  return present(row);
}

import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { MAX_CUSTOM_REMINDERS, NOTIFICATION_COPY } from '../content/notifications.js';

const TYPES = Object.keys(NOTIFICATION_COPY).filter((t) => t !== 'CUSTOM_REMINDER');

// Returns one row per built-in type (defaults off), plus the user's custom reminders.
export async function getPreferences(userId) {
  const rows = await prisma.notificationPreference.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  const builtIn = TYPES.map((type) => {
    const row = rows.find((r) => r.type === type && r.label === null);
    return {
      id: row?.id ?? null,
      type,
      title: NOTIFICATION_COPY[type].title,
      enabled: row?.enabled ?? false,
      timeOfDay: row?.timeOfDay ?? '09:00',
      daysMask: row?.daysMask ?? 127,
    };
  });
  const custom = rows
    .filter((r) => r.type === 'CUSTOM_REMINDER')
    .map((r) => ({ id: r.id, type: r.type, label: r.label, enabled: r.enabled, timeOfDay: r.timeOfDay, daysMask: r.daysMask }));
  return { builtIn, custom };
}

// Upserts built-in reminder settings. Each entry is keyed by type.
export async function updateBuiltInPreferences(userId, items) {
  for (const item of items) {
    const existing = await prisma.notificationPreference.findFirst({ where: { userId, type: item.type, label: null } });
    const data = {
      enabled: item.enabled,
      timeOfDay: item.timeOfDay,
      daysMask: item.daysMask,
    };
    if (existing) {
      await prisma.notificationPreference.update({ where: { id: existing.id }, data });
    } else {
      await prisma.notificationPreference.create({ data: { userId, type: item.type, ...data } });
    }
  }
  return getPreferences(userId);
}

export async function createCustomReminder(userId, { label, timeOfDay, daysMask }) {
  const count = await prisma.notificationPreference.count({ where: { userId, type: 'CUSTOM_REMINDER' } });
  if (count >= MAX_CUSTOM_REMINDERS) {
    throw new AppError(409, 'LIMIT_REACHED', `You can have up to ${MAX_CUSTOM_REMINDERS} custom reminders`);
  }
  const row = await prisma.notificationPreference.create({
    data: { userId, type: 'CUSTOM_REMINDER', label, timeOfDay, daysMask, enabled: true },
  });
  return { id: row.id, label: row.label, timeOfDay: row.timeOfDay, daysMask: row.daysMask, enabled: row.enabled };
}

export async function deleteCustomReminder(userId, id) {
  const { count } = await prisma.notificationPreference.deleteMany({ where: { id, userId, type: 'CUSTOM_REMINDER' } });
  if (count === 0) throw new AppError(404, 'NOT_FOUND', 'That reminder could not be found');
}

export async function registerDevice(userId, { expoToken, platform }) {
  // A token belongs to the device, so re-registering moves it to the current user.
  await prisma.pushToken.upsert({
    where: { expoToken },
    update: { userId, platform, lastSeenAt: new Date() },
    create: { userId, expoToken, platform },
  });
}

export async function listInbox(userId) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { scheduledFor: 'desc' },
    take: 30,
  });
  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    deepLink: n.deepLink,
    scheduledFor: n.scheduledFor.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
  }));
}

export async function markRead(userId, id) {
  await prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
}

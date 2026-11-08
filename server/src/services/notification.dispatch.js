import { prisma } from '../database/prisma.js';
import { env } from '../config/env.js';
import { localParts } from '../utils/dates.js';
import { NOTIFICATION_COPY } from '../content/notifications.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK = 100;

/**
 * Creates due reminders and delivers pending pushes. Runs every minute from the server
 * scheduler. Reminders are decided in each user's own timezone, so "09:00" means 09:00 for them.
 * The dedupeKey (preference id + local date) guarantees at most one reminder per rule per day,
 * even if several server instances run the job.
 */
export async function createDueNotifications(now = new Date()) {
  const rules = await prisma.notificationPreference.findMany({
    where: { enabled: true },
    include: { user: { select: { profile: { select: { timezone: true } } } } },
  });

  let created = 0;
  for (const rule of rules) {
    const tz = rule.user.profile?.timezone ?? 'Asia/Kolkata';
    const local = localParts(tz, now);
    if (local.hhmm !== rule.timeOfDay) continue;
    if (!((rule.daysMask >> local.weekdayIdx) & 1)) continue;

    const copy = NOTIFICATION_COPY[rule.type];
    const title = rule.type === 'CUSTOM_REMINDER' && rule.label ? rule.label : copy.title;
    try {
      await prisma.notification.create({
        data: {
          userId: rule.userId,
          type: rule.type,
          title,
          body: copy.body,
          deepLink: copy.deepLink,
          scheduledFor: now,
          dedupeKey: `${rule.id}:${local.ymd}`,
        },
      });
      created += 1;
    } catch (err) {
      if (err?.code !== 'P2002') throw err; // already created today
    }
  }
  return created;
}

/**
 * Sends Expo pushes for notifications not yet delivered. Tokens that Expo reports as
 * unregistered are deleted so we stop sending to uninstalled apps.
 */
export async function deliverPendingPushes() {
  if (env.PUSH_DELIVERY !== 'expo') return 0;

  const pending = await prisma.notification.findMany({
    where: { sentAt: null, scheduledFor: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    take: 500,
    orderBy: { scheduledFor: 'asc' },
  });

  let delivered = 0;
  for (const n of pending) {
    const tokens = await prisma.pushToken.findMany({ where: { userId: n.userId } });
    if (tokens.length) {
      const messages = tokens.map((t) => ({
        to: t.expoToken,
        title: n.title,
        body: n.body,
        sound: 'default',
        data: { deepLink: n.deepLink, notificationId: n.id },
      }));
      for (let i = 0; i < messages.length; i += CHUNK) {
        await sendChunk(messages.slice(i, i + CHUNK), tokens.slice(i, i + CHUNK));
      }
      delivered += 1;
    }
    await prisma.notification.update({ where: { id: n.id }, data: { sentAt: new Date() } });
  }
  return delivered;
}

async function sendChunk(messages, tokens) {
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
      signal: AbortSignal.timeout(10_000),
    });
    const json = await res.json().catch(() => null);
    const tickets = json?.data ?? [];
    const dead = tickets
      .map((t, i) => (t?.details?.error === 'DeviceNotRegistered' ? tokens[i].expoToken : null))
      .filter(Boolean);
    if (dead.length) await prisma.pushToken.deleteMany({ where: { expoToken: { in: dead } } });
  } catch (err) {
    // Network failure: the notification stays in the inbox; a later run does not resend it.
    console.error('[push] delivery failed:', err?.message ?? err);
  }
}

export function startScheduler() {
  if (env.JOBS_ENABLED !== true) return null;
  const tick = async () => {
    try {
      await createDueNotifications(new Date());
      await deliverPendingPushes();
    } catch (err) {
      console.error('[scheduler]', err?.message ?? err);
    }
  };
  const id = setInterval(tick, 60 * 1000);
  id.unref?.();
  return () => clearInterval(id);
}

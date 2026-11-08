import bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

// Everything the user owns, in readable JSON. Secrets (password hash, tokens) are excluded.
export async function exportUserData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      preferences: true,
      level: true,
      streak: true,
      moods: { include: { tags: true }, orderBy: { recordedAt: 'asc' } },
      assessmentResults: { include: { assessment: { select: { title: true } }, answers: true }, orderBy: { createdAt: 'asc' } },
      breathingSessions: { orderBy: { completedAt: 'asc' } },
      activityCompletions: { include: { activity: { select: { title: true } } }, orderBy: { completedAt: 'asc' } },
      conversations: {
        where: { deletedAt: null },
        include: { messages: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      },
      xpTransactions: { orderBy: { createdAt: 'asc' } },
      notificationPreferences: true,
      notifications: { orderBy: { scheduledFor: 'asc' } },
    },
  });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');

  return {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, createdAt: user.createdAt.toISOString() },
    profile: user.profile
      ? {
          userId: user.profile.userId,
          displayName: user.profile.displayName,
          birthYear: user.profile.birthYear,
          avatarKey: user.profile.avatarKey,
          timezone: user.profile.timezone,
          profileCompletedAt: user.profile.profileCompletedAt,
          createdAt: user.profile.createdAt,
          updatedAt: user.profile.updatedAt,
          avatar: user.profile.avatarData
            ? {
                mimeType: user.profile.avatarMimeType,
                image: Buffer.from(user.profile.avatarData).toString('base64'),
              }
            : null,
        }
      : null,
    preferences: user.preferences,
    progress: { level: user.level, streak: user.streak, xpTransactions: user.xpTransactions },
    moodEntries: user.moods.map((m) => ({ mood: m.mood, intensity: m.intensity, note: m.note, tags: m.tags.map((t) => t.tag), recordedAt: m.recordedAt })),
    assessments: user.assessmentResults.map((r) => ({
      assessment: r.assessment.title,
      totalScore: r.totalScore,
      category: r.category,
      completedAt: r.createdAt,
      answers: r.answers.map((a) => ({ questionId: a.questionId, value: a.value })),
    })),
    breathingSessions: user.breathingSessions.map((s) => ({ pattern: s.pattern, cycles: s.cycles, durationSec: s.durationSec, completed: s.completed, completedAt: s.completedAt })),
    activityCompletions: user.activityCompletions.map((c) => ({ activity: c.activity.title, completedAt: c.completedAt })),
    zenMonkConversations: user.conversations.map((c) => ({
      title: c.title,
      createdAt: c.createdAt,
      messages: c.messages.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
    })),
    notifications: { preferences: user.notificationPreferences, inbox: user.notifications },
  };
}

// Deleting an account removes every related row through ON DELETE CASCADE.
// Password confirmation prevents deletion by someone who only has a logged-in device.
export async function deleteAccount(userId, password) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError(403, 'PASSWORD_INCORRECT', 'That password is not correct');
  await prisma.user.delete({ where: { id: userId } });
}

const PREFERENCE_DEFAULTS = { aiPersonalization: false, aiMemoryConsent: false, reducedMotion: false };

export async function getUserPreferences(userId) {
  const row = await prisma.userPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return {
    aiPersonalization: row.aiPersonalization,
    aiMemoryConsent: row.aiMemoryConsent,
    reducedMotion: row.reducedMotion,
  };
}

export async function updateUserPreferences(userId, input) {
  const data = {};
  for (const key of Object.keys(PREFERENCE_DEFAULTS)) {
    if (input[key] !== undefined) data[key] = input[key];
  }
  await prisma.userPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...PREFERENCE_DEFAULTS, ...data },
  });
  return getUserPreferences(userId);
}

export async function clearAllConversations(userId) {
  await prisma.aiConversation.updateMany({ where: { userId, deletedAt: null }, data: { deletedAt: new Date() } });
}

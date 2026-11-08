import { randomUUID } from 'node:crypto';
import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function getUserTimezone(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { timezone: true },
  });
  return profile?.timezone ?? 'Asia/Kolkata';
}

export async function updateProfile(userId, input) {
  const current = await prisma.userProfile.findUnique({ where: { userId } });
  if (!current) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');

  const data = {};
  if (input.name !== undefined) data.displayName = input.name;
  if (input.birthYear !== undefined) data.birthYear = input.birthYear;
  if (input.timezone !== undefined) data.timezone = input.timezone;
  // First successful save marks setup complete; later edits keep the original timestamp.
  if (!current.profileCompletedAt && input.name !== undefined) {
    data.profileCompletedAt = new Date();
  }

  const updated = await prisma.userProfile.update({ where: { userId }, data });
  return {
    name: updated.displayName,
    birthYear: updated.birthYear,
    timezone: updated.timezone,
    profileCompleted: Boolean(updated.profileCompletedAt),
  };
}

export async function getAvatar(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { avatarData: true, avatarMimeType: true },
  });
  if (!profile) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');

  return {
    mimeType: profile.avatarMimeType,
    image: profile.avatarData ? Buffer.from(profile.avatarData).toString('base64') : null,
  };
}

export async function updateAvatar(userId, file, mimeType) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { userId: true },
  });
  if (!profile) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');

  const updated = await prisma.userProfile.update({
    where: { userId },
    data: {
      avatarData: file,
      avatarMimeType: mimeType,
      avatarKey: randomUUID(),
    },
    select: { avatarMimeType: true },
  });

  return { mimeType: updated.avatarMimeType };
}

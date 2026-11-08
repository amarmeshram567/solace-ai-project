import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { sendPasswordResetEmail } from './email.service.js';

const BCRYPT_ROUNDS = 12;
const RESET_TTL_MINUTES = 30;
// Used so that login takes similar time whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', BCRYPT_ROUNDS);

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.profile?.displayName ?? '',
  profileCompleted: Boolean(user.profile?.profileCompletedAt),
});

function issueAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

// Refresh tokens are opaque random strings. Only their SHA-256 is stored.
async function issueRefreshToken(userId) {
  const raw = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId, tokenHash: sha256(raw), expiresAt } });
  return raw;
}

async function sessionFor(user) {
  return {
    accessToken: issueAccessToken(user.id),
    refreshToken: await issueRefreshToken(user.id),
    user: toPublicUser(user),
  };
}

export async function signup({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    // One write: account, profile, preferences, XP level and streak are created together.
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: { create: { displayName: name } },
        preferences: { create: {} },
        level: { create: {} },
        streak: { create: {} },
      },
      include: { profile: true },
    });
    return sessionFor(user);
  } catch (err) {
    if (err?.code === 'P2002') {
      throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
    throw err;
  }
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }
  return sessionFor(user);
}

// Rotating refresh: each use revokes the presented token and issues a new pair.
export async function refresh(rawToken) {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
    include: { user: { include: { profile: true } } },
  });

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw new AppError(401, 'REFRESH_INVALID', 'Your session has ended. Please log in again.');
  }

  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
  return sessionFor(record.user);
}

// Idempotent: logging out with an unknown token still succeeds.
export async function logout(rawToken) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, preferences: true },
  });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');
  return {
    ...toPublicUser(user),
    timezone: user.profile?.timezone ?? 'Asia/Kolkata',
    preferences: user.preferences,
  };
}

// Always resolves the same way whether or not the account exists, so the endpoint
// cannot be used to discover registered emails.
export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const raw = crypto.randomBytes(32).toString('base64url');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000),
      },
    });
    await sendPasswordResetEmail({ to: user.email, token: raw });
  }
}

export async function resetPassword({ token, password }) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError(400, 'RESET_INVALID', 'This reset code is invalid or has expired.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Changing the password ends every existing session for this account.
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function changePassword(userId, { currentPassword, newPassword, refreshToken }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Account not found');

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError(403, 'PASSWORD_INCORRECT', 'Your current password is not correct');
  }
  if (currentPassword === newPassword) {
    throw new AppError(422, 'PASSWORD_UNCHANGED', 'Choose a password different from your current one');
  }

  const currentSession = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(refreshToken) },
    select: { id: true, userId: true, revokedAt: true, expiresAt: true },
  });
  if (
    !currentSession ||
    currentSession.userId !== userId ||
    currentSession.revokedAt ||
    currentSession.expiresAt < new Date()
  ) {
    throw new AppError(401, 'SESSION_INVALID', 'Your session has ended. Please sign in again.');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null, id: { not: currentSession.id } },
      data: { revokedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);
}

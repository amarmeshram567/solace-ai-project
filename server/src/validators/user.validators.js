import { z } from 'zod';
import { isValidTimeZone } from '../utils/dates.js';
import { MAX_AVATAR_BASE64_LENGTH } from '../utils/avatar.js';

const currentYear = () => new Date().getFullYear();

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(60).optional(),
    birthYear: z
      .number()
      .int()
      .min(1900, 'Enter a valid birth year')
      .max(currentYear() - 5, 'Enter a valid birth year')
      .nullable()
      .optional(),
    timezone: z
      .string()
      .min(1)
      .max(64)
      .refine(isValidTimeZone, 'Unknown timezone')
      .optional(),
  })
  .strict();

export const updateAvatarSchema = z
  .object({
    image: z
      .string()
      .min(1)
      .max(MAX_AVATAR_BASE64_LENGTH)
      .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password').max(72),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters')
      .regex(/[A-Za-z]/, 'Password must include a letter')
      .regex(/\d/, 'Password must include a number'),
    refreshToken: z.string().min(20).max(256),
  })
  .strict();

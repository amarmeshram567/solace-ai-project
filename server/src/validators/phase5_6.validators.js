import { z } from 'zod';
import { NOTIFICATION_COPY } from '../content/notifications.js';

const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time such as 08:30');
const daysMask = z.number().int().min(1).max(127, 'Choose at least one day');
const BUILT_IN = Object.keys(NOTIFICATION_COPY).filter((t) => t !== 'CUSTOM_REMINDER');

export const progressQuerySchema = z.object({
  range: z.enum(['week', 'month']).default('week'),
});

export const updatePreferencesSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            type: z.enum(BUILT_IN),
            enabled: z.boolean(),
            timeOfDay,
            daysMask,
          })
          .strict(),
      )
      .min(1)
      .max(10),
  })
  .strict();

export const customReminderSchema = z
  .object({
    label: z.string().trim().min(1, 'Give the reminder a name').max(60),
    timeOfDay,
    daysMask,
  })
  .strict();

export const registerDeviceSchema = z
  .object({
    expoToken: z.string().trim().regex(/^ExponentPushToken\[.+\]$|^ExpoPushToken\[.+\]$/, 'Invalid push token'),
    platform: z.enum(['android', 'ios']),
  })
  .strict();

export const therapistQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  verified: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const userPreferencesSchema = z
  .object({
    aiPersonalization: z.boolean().optional(),
    aiMemoryConsent: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
  })
  .strict();

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Enter your password to confirm').max(72),
});


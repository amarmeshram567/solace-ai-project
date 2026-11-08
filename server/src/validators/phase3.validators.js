import { z } from 'zod';
import { MOOD_KEYS } from '../content/moods.js';

const clientRequestId = z.string().trim().min(8, 'Invalid request id').max(64);
const tag = z.string().trim().toLowerCase().min(1).max(32);
const tags = z.array(tag).max(5, 'Use at most 5 tags');

const note = z
  .string()
  .max(1000, 'Keep your note under 1000 characters')
  .transform((s) => s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim())
  .nullable();

const intensity = z.number().int().min(1).max(5).nullable();

export const createMoodSchema = z
  .object({
    mood: z.enum(MOOD_KEYS, { errorMap: () => ({ message: 'Choose a mood' }) }),
    intensity: intensity.optional(),
    note: note.optional(),
    tags: tags.optional(),
    clientRequestId,
  })
  .strict();

export const updateMoodSchema = z
  .object({
    mood: z.enum(MOOD_KEYS).optional(),
    intensity,
    note,
    tags,
  })
  .strict();

export const moodListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  before: z.string().datetime().optional(),
});

export const moodAnalyticsQuerySchema = z.object({
  range: z.enum(['week', 'month']).default('week'),
});

export const assessmentSubmitSchema = z
  .object({
    answers: z
      .array(z.object({ questionId: z.string().uuid(), value: z.number().int().min(0).max(3) }).strict())
      .min(1)
      .max(50),
  })
  .strict();

const stepSeconds = z.number().int().min(2).max(10);

export const breathingSessionSchema = z
  .object({
    clientRequestId,
    patternId: z.string().trim().min(1).max(32),
    pattern: z
      .object({ inhale: stepSeconds, hold: stepSeconds, exhale: stepSeconds, rest: stepSeconds })
      .strict(),
    cycles: z.number().int().min(1).max(50),
    durationSec: z.number().int().min(1).max(3600),
    completed: z.boolean(),
  })
  .strict();

export const activityCategoryQuerySchema = z.object({
  category: z.enum(['MINDFULNESS', 'SELF_LOVE', 'STRESS_RELIEF', 'BETTER_SLEEP']).optional(),
});

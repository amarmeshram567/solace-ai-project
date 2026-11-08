import { z } from 'zod';

// Strip control characters and trim. The model never receives raw control bytes.
const cleanText = (max) =>
  z
    .string()
    .max(max)
    .transform((s) => s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, ' ').replace(/[ \t]+/g, ' ').trim());

export const createConversationSchema = z
  .object({ title: cleanText(120).optional() })
  .strict();

export const renameConversationSchema = z
  .object({ title: cleanText(120).pipe(z.string().min(1, 'Give the conversation a name')) })
  .strict();

export const sendMessageSchema = z
  .object({ content: cleanText(2000).pipe(z.string().min(1, 'Write a message first')) })
  .strict();

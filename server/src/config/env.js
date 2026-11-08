import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8081')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),
  AI_PROVIDER: z.enum(['ollama', 'disabled']).default('ollama'),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('qwen2.5:3b'),
  // "console" prints reset codes to the server log (development only).
  // Production must use a real mail provider; see services/email.service.js.
  EMAIL_DELIVERY: z.enum(['console', 'disabled']).default('console'),
  // "expo" sends reminders through Expo's push service; "disabled" keeps them in the inbox only.
  PUSH_DELIVERY: z.enum(['disabled', 'expo']).default('disabled'),
  // Runs the reminder scheduler inside this process. Enable on one instance only.
  JOBS_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast at boot with readable messages; never print secret values.
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

if (parsed.data.NODE_ENV === 'production' && parsed.data.EMAIL_DELIVERY === 'console') {
  throw new Error('EMAIL_DELIVERY=console is not allowed in production. Configure a mail provider.');
}

// The example file ships placeholder secrets. Refuse to run production with them,
// so copying .env.example unchanged cannot silently sign tokens with a public value.
if (parsed.data.NODE_ENV === 'production') {
  const placeholder = (v) => /replace-with/i.test(v);
  if (placeholder(parsed.data.JWT_ACCESS_SECRET) || placeholder(parsed.data.JWT_REFRESH_SECRET)) {
    throw new Error('Production JWT secrets must be generated, not copied from .env.example.');
  }
  if (parsed.data.JWT_ACCESS_SECRET === parsed.data.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
  }
}

export const env = Object.freeze(parsed.data);

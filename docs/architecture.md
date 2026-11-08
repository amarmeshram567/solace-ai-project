# Architecture

## Overview

```
Mobile app (Expo, JavaScript)
   │  HTTPS JSON, bearer access token
   ▼
Express API  /api/v1   ── JWT auth, Zod validation, rate limits
   │
   ├── PostgreSQL (Neon) via Prisma
   └── AI service ── provider interface ── Ollama (self-hosted Qwen / Llama)
```

The mobile app holds no secrets. Its only configuration is `EXPO_PUBLIC_API_URL`.

## Mobile

- Expo Router, file-based routes in `mobile/app`. Route groups `(auth)` and `(tabs)` arrive in Phase 2.
- `src/theme` holds design tokens; `src/components` holds reusable UI; `src/services` holds API and device storage access.
- Tokens: the refresh token lives in SecureStore. Onboarding completion lives in AsyncStorage.

## Server

- `app.js` wires middleware; `server.js` binds `0.0.0.0` and handles graceful shutdown.
- Layers: routes → validators (Zod) → services (business logic) → Prisma. Repositories are introduced when query reuse justifies them.
- Errors: `AppError` for expected failures; everything else becomes a generic 500 with the detail logged server-side only.
- Ownership: `req.user.id` comes only from the verified access token.

## Auth

- Access token: JWT HS256, 15-minute TTL, subject = user id.
- Refresh token: 48 random bytes, stored as SHA-256 hash, rotated on every use, revoked on logout.
- Passwords: bcrypt cost 12, with a dummy hash compare on unknown emails to limit timing signals.

## AI provider contract

See `server/src/ai/provider.js`. Each provider exposes `name`, `health()` and `chat(messages, { signal })`. Failures throw `AppError(503, 'AI_UNAVAILABLE')`. The app shows that error honestly; it never substitutes canned text as model output.

## Scheduling and notifications (Phase 6)

Reminders are computed server-side from `notification_preferences` in each user's timezone and delivered via Expo Push. The device does not rely on JavaScript timers for reminders.

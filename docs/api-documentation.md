# API reference (Phases 1–6)

Base URL: `/api/v1`. All responses are JSON:

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code": "EMAIL_TAKEN", "message": "..." } }
```

Validation failures return `422` with `error.details: [{ field, message }]`.

## Implemented

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/health` | none | Liveness check |
| POST | `/auth/signup` | none | Body: `name, email, password, confirmPassword`. Returns `accessToken, refreshToken, user`. 201. |
| POST | `/auth/login` | none | Body: `email, password`. Rate-limited (20 per 15 min). |
| POST | `/auth/refresh` | none | Body: `refreshToken`. Rotates the pair. |
| POST | `/auth/logout` | none | Body: `refreshToken`. Idempotent. |
| GET | `/auth/me` | Bearer | Returns the current user and preferences. |
| POST | `/auth/forgot-password` | none | Body: `email`. Always returns the same message, so it cannot reveal which emails are registered. |
| POST | `/auth/reset-password` | none | Body: `token, password, confirmPassword`. Ends all existing sessions. |
| PATCH | `/users/me` | Bearer | Body (all optional): `name, birthYear, timezone`. The first save with a name completes profile setup. |
| GET | `/home` | Bearer | Greeting data, `level` (XP, progress, next target), `streak`, and today's `affirmation`. |
| GET | `/affirmations/daily` | Bearer | Today's affirmation. One per user per local day. |
| POST | `/affirmations/daily/refresh` | Bearer | Replaces today's affirmation with a different one, avoiding ones seen in the last 14 days. |
| POST | `/affirmations/daily/save` | Bearer | Body: `saved` (boolean). |

Error codes in use: `VALIDATION_ERROR`, `EMAIL_TAKEN`, `INVALID_CREDENTIALS`, `REFRESH_INVALID`, `UNAUTHORIZED`, `TOKEN_INVALID`, `USER_NOT_FOUND`, `RESET_INVALID`, `RATE_LIMITED`, `NOT_FOUND`, `NO_AFFIRMATIONS`, `AI_UNAVAILABLE`, `MALFORMED_JSON`, `INTERNAL_ERROR`.

## Mood (Phase 3)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/moods` | Body: `mood, intensity?, note?, tags?, clientRequestId`. Repeating the same `clientRequestId` returns the original entry with no new XP. Returns `reflection, suggestion, reward`. |
| GET | `/moods?limit&before` | Newest first. Cursor is `nextCursor`. |
| GET | `/moods/analytics?range=week\|month` | Counts by mood and per day. |
| GET | `/moods/:id` | Owner only. |
| PATCH | `/moods/:id` | Edit mood, intensity, note or tags. |
| DELETE | `/moods/:id` | Owner only. |

## Assessments (Phase 3)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/assessments` | Active assessments with disclaimers. |
| GET | `/assessments/:id` | Questions and the answer scale. |
| POST | `/assessments/:id/submit` | Body: `answers: [{questionId, value 0–3}]`. Every question must be answered once. Returns score, category, summary and recommendations. |
| GET | `/assessments/history` | Newest first. |

## Breathing (Phase 3)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/breathing/sessions` | Body: `clientRequestId, patternId, pattern{inhale,hold,exhale,rest}, cycles, durationSec, completed`. Repeats are de-duplicated. XP only when completed. |
| GET | `/breathing/sessions` | Latest 20. |
| GET | `/breathing/statistics` | Totals and last 7 days. |

## Wellness (Phase 3)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/wellness/resources` | Titles and summaries. |
| GET | `/wellness/resources/:id` | Full sections. |
| GET | `/wellness/activities?category=` | Filter by MINDFULNESS, SELF_LOVE, STRESS_RELIEF, BETTER_SLEEP. |
| GET | `/wellness/activities/:id` | Steps and duration. |
| POST | `/wellness/activities/:id/complete` | Once per local day for XP. |

## Zen Monk (Phase 4)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/ai/conversations` | Optional `title`. |
| GET | `/ai/conversations` | Newest first. |
| GET | `/ai/conversations/:id` | Messages, oldest first. |
| PATCH | `/ai/conversations/:id` | Body: `title`. |
| DELETE | `/ai/conversations/:id` | Soft delete. |
| POST | `/ai/conversations/:id/messages` | Body: `content` (max 2000). Rate-limited to 30 per 10 minutes per user. Returns `userMessage, assistantMessage, suggestions, crisis`. Returns 503 `AI_UNAVAILABLE` when the model cannot be reached; the user message is kept so the app can retry. |
| DELETE | `/ai/messages/:id` | Soft delete of one message. |

Crisis-pattern messages receive a fixed, reviewed reply and never reach the model.

| Method | Path | Notes |
| --- | --- | --- |
| DELETE | `/ai/conversations` | Clears every conversation for the user (soft delete). |

## Progress (Phase 5)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/progress?range=week\|month` | Level, streak, totals, range counts, mood distribution, daily mood trend, recent self-checks, milestones. `isEmpty` is true for a new account. |
| GET | `/progress/xp` | Total XP, level, progress to next level, and the 20 most recent XP awards. |
| GET | `/progress/streaks` | Current streak (0 if the last active day was before yesterday), longest streak, last active date. |
| GET | `/progress/achievements` | The ten milestones with `progress`, `target` and `unlocked`. |

Milestones are calculated from stored records on each request. Nothing is awarded or stored separately.

## Reminders and notifications (Phase 6)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/notifications/preferences` | One entry per built-in reminder (defaults to off), plus the user's custom reminders. |
| PATCH | `/notifications/preferences` | Body: `items: [{type, enabled, timeOfDay "HH:mm", daysMask 1–127}]`, up to 10 items. `type` is one of `DAILY_MOOD_CHECKIN`, `DAILY_AFFIRMATION`, `BREATHING_REMINDER`, `SELF_CARE_REMINDER`. `daysMask` bit 0 is Monday. |
| POST | `/notifications/custom` | Body: `label` (max 60), `timeOfDay`, `daysMask`. Returns 409 `LIMIT_REACHED` after ten. |
| DELETE | `/notifications/custom/:id` | Owner only. |
| POST | `/notifications/devices` | Body: `expoToken`, `platform` (`ios` or `android`). Registers or moves this device's push token. Returns 204. |
| GET | `/notifications/inbox` | Latest 30 reminders, newest first, with `deepLink` and `readAt`. |
| POST | `/notifications/inbox/:id/read` | Marks one reminder as read. |

## Therapist directory (Phase 6)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/therapists?q&city&verified=true\|false&limit&offset` | Public, no sign-in needed. `q` matches name or specialty; `city` matches the city text. Returns `items, total, limit, offset`. Listings with `isSample: true` are placeholders. |
| GET | `/therapists/:id` | One listing. 404 if not found. |

The server never receives the user's device coordinates. The app reads a city name on the phone, and only that name is sent.

## Privacy and account (Phase 6)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/users/me/preferences` | `aiPersonalization`, `aiMemoryConsent`, `reducedMotion`. |
| PATCH | `/users/me/preferences` | Any of the three booleans. Returns the updated preferences. |
| GET | `/users/me/export` | Everything held for the user as JSON: profile, check-ins, self-checks, breathing and activity records, chats, XP history, and reminder settings. Never includes the password hash, refresh tokens or reset tokens. |
| DELETE | `/users/me` | Body: `password`. Returns 403 `PASSWORD_INCORRECT` on mismatch. Removes the account and all related data (cascade). |

Error codes added in Phases 5–6: `LIMIT_REACHED`, `PASSWORD_INCORRECT`.

## Example

```bash
curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"Calm1234"}'
```

# Solace AI — Phases 1–8

Solace AI is a calm, reference-inspired wellness companion. This archive contains **Phases 1–8** from the project specification, as one cumulative project.

- **Phase 1 — Foundation:** Expo app with Expo Router and theme; Express API under `/api/v1`; full PostgreSQL schema (Prisma); JWT auth with rotating refresh tokens.
- **Phase 2 — Visual foundation:** splash, persisted onboarding, auth screens, forgot/reset password, profile setup, home dashboard, bottom tabs.
- **Phase 3 — Wellness features:** mood check-in (with duplicate protection), mood history with edit/delete and weekly/monthly view, three self-reflection assessments with transparent scoring, breathing session with a synchronised circle, wellness resources and activities.
- **Phase 4 — AI companion:** Zen Monk chat backed by Google Gemini, persistent conversations, deleting messages, context-limited prompts, optional personalisation, safety handling, and activity suggestions that link to app screens.
- **Phase 5 — Progress:** progress dashboard (weekly and monthly), levels, streaks, XP history, milestones calculated from real records, and recent self-check history.
- **Phase 6 — Reminders, directory and privacy:** daily reminder settings with time and day choices, custom reminders (up to ten), an in-app reminder inbox, optional push delivery through Expo, a therapist directory, AI personalisation controls, chat clearing, data export, and account deletion.
- **Phase 7 — Testing and refinement:** unit tests for the pure logic (`npm test`). They found and fixed two real bugs: crisis detection missed common phrasings, and reminder keyword rules matched inside unrelated words. Production now refuses to start with the placeholder JWT secrets.
- **Phase 8 — Submission:** EAS build profiles (`mobile/eas.json`) for an installable APK and a store bundle, a production configuration checklist, and a release checklist with the demo sequence and screenshot list. See `docs/release-checklist.md`.

## Scope status (be clear about this)

| Area | Status |
| --- | --- |
| Splash, onboarding, auth (login, signup, refresh, logout, forgot/reset), profile setup | Implemented |
| Home dashboard, bottom tabs, Wellness Moves, daily affirmation | Implemented |
| Mood check-in, mood history, edit and delete | Implemented |
| Mood analytics (week and month) | Implemented (counts and daily bars) |
| Assessments: Mood Vibes, Anxiety Check, Self-love Meter, results and history | Implemented. Anxiety Check is an informal reflection, not a validated clinical instrument |
| Breathing: configurable pattern, pause/resume/restart, exit confirmation, haptics, saved sessions | Implemented. The default pattern is 4-4-4-4 for 5 rounds. Ambient sound is not included |
| Wellness resources (5) and activities (4) with interactive steps | Implemented |
| Zen Monk chat: conversations, rename/delete, message delete, suggestions, typing indicator, errors, safety | Implemented. Needs a Gemini API key configured on the server |
| Clear all Zen Monk chats; AI personalisation switch (off by default) | Implemented |
| XP awards, levels and daily streaks | Implemented |
| Progress dashboard (week and month), level, streak, mood trend and distribution | Implemented |
| Milestones (ten) and recent self-checks | Implemented. Milestones are calculated from stored records each time |
| Daily reminder settings, custom reminders (max 10), reminder inbox | Implemented. Reminders are created by a server scheduler when `JOBS_ENABLED=true` |
| Push notifications | Implemented behind `PUSH_DELIVERY=expo`. Needs an EAS project ID and a development build; Expo Go does not deliver remote push on current SDKs |
| Therapist directory (search, city, verified filter, "use my city" on device) | Implemented. **All seeded listings are sample entries, marked as such in the app.** Verify real providers before listing them |
| Privacy: data export (JSON, no password or tokens), delete account with password, clear chats | Implemented |
| Crisis helpline numbers | Only 112 is listed. Verify helplines before release |
| Email delivery for password reset | Console only (development). Connect a mail provider before production |
| Automated tests | Unit tests for pure logic (`cd server && npm test`, 37 tests). No database, HTTP or mobile UI tests yet |
| Android APK and store bundle | Build profiles and steps provided. **The binaries are not in this archive**; they need your EAS account |
| Demo video and screenshots | Plan and screen list provided in `docs/release-checklist.md`. **Not produced**; they need a device and a live server |

**Not yet run.** The code has not been executed in the environment that produced it. Run the setup below and fix anything the first run surfaces. Phases 5 and 6 were written without a running device or database, so expect a short round of fixes on first run.

## Prerequisites

- Node.js 20.19+ (required by current Expo SDK) and npm.
- A PostgreSQL database. Neon works: create a project, copy the connection string with `sslmode=require`.
- Android Studio emulator, or a development build on a physical device.
- (Optional, for AI chat) A Google Gemini API key configured on the server.

## 1. Backend

```bash
cd server
cp .env.example .env          # fill DATABASE_URL and the two JWT secrets
npm install
npx prisma migrate dev --name init          # fresh database
npm run seed
npm run dev                   # http://localhost:4000/api/v1/health
```

If you already ran an earlier archive against this database, use the migration name for this archive instead of `init`: `npx prisma migrate dev --name phases-1-6`. Then run `npm run seed` again; it is safe to repeat.

Generate secrets with: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

Smoke test:

```bash
curl -s localhost:4000/api/v1/health
curl -s -X POST localhost:4000/api/v1/auth/signup -H 'Content-Type: application/json' \
  -d '{"name":"Amar","email":"you@example.com","password":"Calm1234","confirmPassword":"Calm1234"}'
```

Forgot password (development): request a code in the app, then copy the code printed in the server terminal into "I have a reset code".

### Reminders (Phase 6)

Reminders are created by a scheduler that runs every minute inside the API process. It is off by default.

- `JOBS_ENABLED=true` turns the scheduler on. Run it on **one** instance only.
- Reminder times are read in each user's own timezone, so "09:00" means 09:00 where they live.
- Each reminder is created at most once per local day, enforced by a unique key in the database.
- `PUSH_DELIVERY=expo` also sends each reminder to the user's registered devices through Expo. Tokens that Expo reports as unregistered are removed.

### Zen Monk (Phase 4): Gemini

Set `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and optionally `GEMINI_MODEL` in `server/.env`. The default model is `gemini-3.5-flash-lite`. The key stays on the server and must never be added to the mobile app or an `EXPO_PUBLIC_` variable. If Gemini is unavailable, Zen Monk shows a clear "unavailable" message rather than inventing replies. Set `AI_PROVIDER=disabled` to turn off model chat.

## 2. Mobile app

```bash
cd mobile
cp .env.example .env
npm install
npx expo install --check      # aligns native module versions to the installed Expo SDK
npx expo start
```

- Android emulator reaches the host API at `http://10.0.2.2:4000/api/v1` (default in `.env.example`).
- Physical device: set `EXPO_PUBLIC_API_URL` to your computer's LAN IP, e.g. `http://192.168.1.20:4000/api/v1`, and make sure the server is listening on `0.0.0.0` (it is by default).
- Push reminders: set `EXPO_PUBLIC_EAS_PROJECT_ID` to your EAS project ID. Without it the app still works, and reminders appear in the in-app inbox.
- Native modules (`expo-notifications`, `expo-location`, `expo-file-system`, `expo-sharing`, `expo-secure-store`) require a development build for full behaviour: `npx expo run:android`.
- The new Phase 5/6 dependencies (`expo-device`, `expo-file-system`, `expo-location`, `expo-sharing`) were pinned to the SDK 54 ranges in `package.json` but not installed here. `npx expo install --check` is the authority for exact versions.

## 3. Production APK (later phase, documented for planning)

```bash
npm i -g eas-cli
cd mobile && eas build -p android --profile preview
```

## Environment variables

See `server/.env.example` and `mobile/.env.example`. Secrets live only in the server environment. The mobile app never receives model credentials, database URLs, or JWT secrets. It only receives `EXPO_PUBLIC_API_URL` and, optionally, `EXPO_PUBLIC_EAS_PROJECT_ID`.

Server variables added in Phases 5–6: `PUSH_DELIVERY` (`disabled` by default, or `expo`) and `JOBS_ENABLED` (`false` by default).

## Safety notes

- Solace is not a substitute for psychologists, psychiatrists, therapists, emergency services, or medical diagnosis.
- Therapist listings in this archive are samples for development. They are not real practices.
- Crisis-line numbers must be verified against current official sources before release. This archive lists only 112.
- Mood history, AI conversations and exported data are sensitive. Treat them accordingly in logs and analytics. Exports and logs never include password hashes or tokens.

## Testing (Phase 7)

```bash
cd server
npm test
```

The tests use Node's built-in runner and need no database. They cover:

- date and timezone handling, including the midnight boundary and weekday mapping
- level thresholds and progress
- streak continuity, including missed days and repeat activity on one day
- XP awards: idempotency per source key, level-up detection, and separation between users
- crisis detection and reminder suggestions
- assessment score bands, checked for gaps and overlaps
- mood keys shared between server and app, achievement metrics, and reminder deep links pointing at real screens

Not yet covered by automated tests: authentication, database persistence, HTTP responses, assessment submission against the database, notification delivery, breathing animation, and navigation. Those need the device and database run-through in `docs/release-checklist.md`.

## Release (Phase 8)

See `docs/release-checklist.md` for the production configuration table, EAS build steps for the APK and store bundle, TestFlight readiness, and known limitations.

## Layout

```
mobile/   Expo app (Expo Router, JavaScript)
server/   Express API, Prisma schema, AI provider, reminder scheduler, seed
docs/     Architecture, database schema, API reference
```

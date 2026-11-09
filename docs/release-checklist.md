# Release checklist (Phase 8)

This checklist separates what the repository already provides from what must be done on a machine with a device, an Android SDK or an EAS account, and Apple developer credentials. Items marked **not in this archive** were not produced here.

## 1. Before building

- [ ] Server tests pass: `cd server && npm test`. These cover pure logic only: dates, levels, streaks, XP idempotency, crisis detection, suggestions, assessment bands, mood and achievement consistency, and reminder deep links. They do **not** cover the database, HTTP routes or the mobile screens.
- [ ] Database migration applied on the target database: `npx prisma migrate deploy`. Then `npm run seed`.
- [ ] Manual device run-through, using the Phase 7 list in the spec: authentication, persistence (restart the app and confirm data is still there), mood check-in, assessment scoring, breathing animation, Zen Monk conversation and history, streak logic, reminder delivery, navigation, and the back button on Android.
- [ ] Critical bugs from that run-through are fixed. Record each one and its fix in the changelog.

## 2. Production server configuration

Set these in the host environment. Never commit them.

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Managed PostgreSQL with `sslmode=require` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Two different random values, at least 64 characters each. The server refuses to start if these still contain the example placeholder text |
| `CORS_ORIGINS` | Only the origins you need. Native apps do not send an Origin header |
| `EMAIL_DELIVERY` | `disabled` until a mail provider is wired in. The server refuses `console` in production |
| `AI_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_MODEL` | Keep the Gemini key in the server environment; use `disabled` to return an honest 503 from chat |
| `JOBS_ENABLED` | `true` on **one** instance only |
| `PUSH_DELIVERY` | `expo` once the EAS project ID is set in the app build |

Serve the API over HTTPS. The mobile build must use an `https://` `EXPO_PUBLIC_API_URL`. Cleartext HTTP is only for local development.

## 3. Android APK (preview) and Play bundle (production)

```bash
npm i -g eas-cli
cd mobile
eas login
eas init                                  # creates the EAS project; copy its ID to EXPO_PUBLIC_EAS_PROJECT_ID
```

1. In `mobile/eas.json`, replace `REPLACE_WITH_HTTPS_API_URL` in the `preview` and `production` profiles with your real HTTPS API URL.
2. Install native dependencies to SDK-aligned versions: `npx expo install --check`. Fix anything it reports before building.
3. Build an installable APK for testers:

   ```bash
   eas build -p android --profile preview
   ```

4. Install the APK on a physical Android phone and repeat the run-through in section 1.
5. Build the store bundle:

   ```bash
   eas build -p android --profile production
   ```

Expected output: an `.apk` from `preview` and an `.aab` from `production`, both downloadable from the EAS dashboard. **Not in this archive:** the built binaries. They need your EAS account and cannot be produced from the repository alone.

## 4. iOS / TestFlight readiness (future)

- [ ] Apple Developer Program membership and the bundle ID `com.solaceai.app` registered.
- [ ] `eas build -p ios --profile production` produces an `.ipa` once credentials exist. Keep `buildNumber` in `app.json` in step with each upload.
- [ ] Push notifications on iOS need the Push Notifications capability and an APNs key, which EAS can manage for you.
- [ ] Describe the location and notification permissions in App Store Connect. They match the strings in `app.json`.
- [ ] Not verified here: the iOS build has not been attempted.

## 5. Store and sharing material

Still to produce on a device or with your own accounts. None of these are in the archive.

- [ ] **Screenshots**, taken on the production build at phone size. Suggested set: onboarding, home, mood check-in, an assessment result, breathing, Zen Monk conversation, wellness resources, progress, reminder settings, therapist directory.
- [ ] **Demo video**, 2–3 minutes. Follow this order and show real interactions:
  1. Splash and onboarding
  2. Login and profile setup
  3. Home dashboard
  4. Daily mood check-in
  5. Assessment and result
  6. Breathing exercise
  7. Zen Monk AI conversation, live against a running model (do not use recorded or invented replies as evidence)
  8. Wellness resources
  9. XP and progress dashboard
  10. Notification settings

  Note that therapist listings are samples, and say so on screen if they appear.

- [ ] Store listing text: what Solace is, what it is not (not a therapist, no diagnosis, no medication advice), and a link to the privacy and data screen.
- [ ] Privacy policy URL that matches what the app actually does: what is collected, where it is stored, export and deletion.

## 6. Known limitations to disclose

- Assessments are informal self-reflections, not validated clinical instruments.
- Crisis handling uses fixed text and keyword rules. It is deliberately broad, but it is not a clinical triage system. Only 112 is listed as an emergency number. Verify local helplines before release.
- Therapist listings are sample data until real providers are verified.
- AI replies come from a self-hosted model. Quality varies by model, and the model is not medical advice.
- Two concurrent requests that award the same XP key can cause one request to fail rather than return "already awarded". A retry then succeeds. Fixing this properly needs an atomic upsert and is a follow-up.
- Reminders are created by a scheduler inside the API process. A reminder is missed if the server is down at that minute. Run the scheduler on one instance only.
- No automated tests cover the database, the HTTP routes, or the mobile screens yet.

## 7. Demo video and screenshots: honest status

The repository contains the checklist above, the demo sequence and the screen list. It does not contain a recording or screenshots, because those need a physical device running the production build against a live server.

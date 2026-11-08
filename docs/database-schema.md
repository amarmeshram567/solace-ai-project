# Database schema

Source of truth: `server/prisma/schema.prisma`. Apply with `npx prisma migrate dev`.

| Group | Tables |
| --- | --- |
| Identity | `users`, `user_profiles`, `user_preferences`, `refresh_tokens`*, `password_reset_tokens`* |
| Mood | `mood_entries`, `mood_tags` |
| Assessments | `assessments`, `assessment_questions`, `assessment_results`, `assessment_answers` |
| Wellness | `wellness_resources`, `wellness_activities`, `activity_completions`, `user_saved_resources` |
| Affirmations | `affirmations`, `user_affirmations` |
| Breathing | `breathing_sessions` |
| AI | `ai_conversations`, `ai_messages`, `user_ai_memories` |
| Gamification | `xp_transactions`, `user_levels`, `user_streaks` |
| Notifications | `notification_preferences`, `notifications`, `push_tokens` |
| Directory | `therapist_profiles` |

\* Added beyond the 25 entities in the specification (needed for refresh rotation and password reset).

## Key rules

- **Isolation:** every personal table has `user_id` with `ON DELETE CASCADE` from `users`, so deleting an account removes all personal data.
- **Idempotency:** `mood_entries(user_id, client_request_id)` and `xp_transactions(user_id, source_key)` are unique, so retries cannot duplicate records or rewards.
- **One reward per day:** `activity_completions(user_id, activity_id, completed_on)` is unique.
- **Affirmation variety:** `user_affirmations(user_id, shown_on)` is unique (one per day) and indexed by affirmation for recency checks.
- **Dates:** `completed_on`, `shown_on`, `last_active_date` are calendar dates in the user's timezone, which makes streaks and day boundaries correct for travellers and UTC-offset users.
- **XP transactions:** write the transaction row and update `user_levels.total_xp` in one database transaction.
- **Sensitive content:** `ai_messages` and `mood_entries.note` are personal data; retention and export rules apply.

ALTER TABLE "user_profiles"
ADD COLUMN "avatar_data" BYTEA,
ADD COLUMN "avatar_mime_type" VARCHAR(32);

-- Add rsvpSubmittedAt column (exists in dev via db push but missing on production Turso)
ALTER TABLE "Guest" ADD COLUMN "rsvpSubmittedAt" DATETIME;

-- Backfill: rsvpRespondedAt holds the identical timestamp written on first RSVP submission
UPDATE "Guest"
SET "rsvpSubmittedAt" = "rsvpRespondedAt"
WHERE "rsvpRespondedAt" IS NOT NULL
  AND "rsvpSubmittedAt" IS NULL;

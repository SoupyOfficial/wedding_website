-- Add isVegetarian column for RSVP vegetarian meal option (dev via db push, missing on production Turso)
ALTER TABLE "Guest" ADD COLUMN "isVegetarian" BOOLEAN NOT NULL DEFAULT false;

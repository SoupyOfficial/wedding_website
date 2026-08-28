-- Add guestId + question to SongRequest so RSVP song answers carry the requester and the question they answered (Guest.danceSong/firstDanceSong already exist on production Turso)
ALTER TABLE "SongRequest" ADD COLUMN "guestId" TEXT;
ALTER TABLE "SongRequest" ADD COLUMN "question" TEXT NOT NULL DEFAULT '';

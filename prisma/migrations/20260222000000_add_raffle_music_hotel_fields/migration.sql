-- AlterTable: SiteSettings - add raffleTicketCount
ALTER TABLE "SiteSettings" ADD COLUMN "raffleTicketCount" INTEGER NOT NULL DEFAULT 2;

-- AlterTable: Hotel - add distanceFromVenue, priceRange, amenities
ALTER TABLE "Hotel" ADD COLUMN "distanceFromVenue" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Hotel" ADD COLUMN "priceRange" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Hotel" ADD COLUMN "amenities" TEXT NOT NULL DEFAULT '';

-- AlterTable: SongRequest - add artworkUrl, previewUrl, isVisible
ALTER TABLE "SongRequest" ADD COLUMN "artworkUrl" TEXT;
ALTER TABLE "SongRequest" ADD COLUMN "previewUrl" TEXT;
ALTER TABLE "SongRequest" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT false;

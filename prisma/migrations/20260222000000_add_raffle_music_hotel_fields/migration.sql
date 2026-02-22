-- AlterTable: SiteSettings - add raffleTicketCount, registryNote, entertainmentNote
ALTER TABLE "SiteSettings" ADD COLUMN "raffleTicketCount" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "SiteSettings" ADD COLUMN "registryNote" TEXT NOT NULL DEFAULT 'Truly, your love and support mean the most to us. We are just grateful to have you celebrate this special day with us. If you do choose to give a gift, please know that it is cherished deeply.';
ALTER TABLE "SiteSettings" ADD COLUMN "entertainmentNote" TEXT NOT NULL DEFAULT 'Our reception will be a celebration filled with music, dancing, games, and memories! We want everyone to have an incredible time.';

-- AlterTable: Hotel - add distanceFromVenue, priceRange, amenities
ALTER TABLE "Hotel" ADD COLUMN "distanceFromVenue" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Hotel" ADD COLUMN "priceRange" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Hotel" ADD COLUMN "amenities" TEXT NOT NULL DEFAULT '';

-- AlterTable: SongRequest - add artworkUrl, previewUrl, isVisible
ALTER TABLE "SongRequest" ADD COLUMN "artworkUrl" TEXT;
ALTER TABLE "SongRequest" ADD COLUMN "previewUrl" TEXT;
ALTER TABLE "SongRequest" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: DJList - add playTime
ALTER TABLE "DJList" ADD COLUMN "playTime" TEXT NOT NULL DEFAULT '';

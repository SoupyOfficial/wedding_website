ALTER TABLE "WeddingPartyMember" ADD COLUMN "confirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SiteSettings" ADD COLUMN "hideUnconfirmedWeddingParty" BOOLEAN NOT NULL DEFAULT false;

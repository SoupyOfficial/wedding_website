-- AlterTable: RegistryItem - add itemType, price, totalNeeded, totalBought, goalAmount, raisedAmount, description, status
ALTER TABLE "RegistryItem" ADD COLUMN "itemType" TEXT NOT NULL DEFAULT 'store';
ALTER TABLE "RegistryItem" ADD COLUMN "price" REAL;
ALTER TABLE "RegistryItem" ADD COLUMN "totalNeeded" INTEGER;
ALTER TABLE "RegistryItem" ADD COLUMN "totalBought" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RegistryItem" ADD COLUMN "goalAmount" REAL;
ALTER TABLE "RegistryItem" ADD COLUMN "raisedAmount" REAL NOT NULL DEFAULT 0;
ALTER TABLE "RegistryItem" ADD COLUMN "description" TEXT;
ALTER TABLE "RegistryItem" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

-- CreateTable: RegistryContribution
CREATE TABLE "RegistryContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registryItemId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "amount" REAL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "SiteSettings" ADD COLUMN "rsvpEditDeadline" DATETIME;
ALTER TABLE "Guest" ADD COLUMN "inviteToken" TEXT;
ALTER TABLE "Photo" ADD COLUMN "submittedByName" TEXT;
CREATE UNIQUE INDEX "Guest_inviteToken_key" ON "Guest"("inviteToken");
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contactName" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "contractStatus" TEXT NOT NULL DEFAULT 'none',
    "depositDueDate" DATETIME,
    "finalPaymentDueDate" DATETIME,
    "totalCost" REAL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL DEFAULT '',
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "actualCost" REAL,
    "depositAmount" REAL,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "notes" TEXT NOT NULL DEFAULT '',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "vendorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE "SeatingTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 8,
    "shape" TEXT NOT NULL DEFAULT 'round',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

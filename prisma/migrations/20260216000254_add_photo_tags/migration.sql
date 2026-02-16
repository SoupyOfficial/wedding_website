-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "takenAt" DATETIME;

-- CreateTable
CREATE TABLE "PhotoTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "color" TEXT NOT NULL DEFAULT '#C9A84C',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_PhotoToPhotoTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PhotoToPhotoTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Photo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PhotoToPhotoTag_B_fkey" FOREIGN KEY ("B") REFERENCES "PhotoTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoTag_name_type_key" ON "PhotoTag"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "_PhotoToPhotoTag_AB_unique" ON "_PhotoToPhotoTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PhotoToPhotoTag_B_index" ON "_PhotoToPhotoTag"("B");

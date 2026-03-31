-- CreateTable: Hierarchisches Kategorie-System
CREATE TABLE "Category" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "parentId"  TEXT,
    "iconName"  TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Self-referential Relation (Baum-Struktur)
ALTER TABLE "Category"
    ADD CONSTRAINT "Category_parentId_fkey"
    FOREIGN KEY ("parentId")
    REFERENCES "Category"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Indexes für Category
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- AlterTable: ScannedItem bekommt kategorie-FK + denorm. Pfad
ALTER TABLE "ScannedItem"
    ADD COLUMN "categoryId"   TEXT,
    ADD COLUMN "categoryPath" TEXT;

-- FK von ScannedItem → Category
ALTER TABLE "ScannedItem"
    ADD CONSTRAINT "ScannedItem_categoryId_fkey"
    FOREIGN KEY ("categoryId")
    REFERENCES "Category"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Index
CREATE INDEX "ScannedItem_categoryId_idx" ON "ScannedItem"("categoryId");

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScannedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "condition" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "gtin" TEXT,
    "searchQuery" TEXT NOT NULL,
    "searchQueries" JSONB,
    "imageFilename" TEXT NOT NULL,
    "originalUri" TEXT,
    "priceStats" JSONB,
    "ebayListings" JSONB,
    "ebayListingsFetchedAt" TIMESTAMP(3),
    "marketValue" JSONB,
    "marketValueFetchedAt" TIMESTAMP(3),
    "scannedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScannedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");

-- CreateIndex
CREATE INDEX "ScannedItem_userId_idx" ON "ScannedItem"("userId");

-- CreateIndex
CREATE INDEX "ScannedItem_scannedAt_idx" ON "ScannedItem"("scannedAt");

-- CreateIndex
CREATE INDEX "ScannedItem_productName_idx" ON "ScannedItem"("productName");

-- CreateIndex
CREATE INDEX "ScannedItem_category_idx" ON "ScannedItem"("category");

-- AddForeignKey
ALTER TABLE "ScannedItem" ADD CONSTRAINT "ScannedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

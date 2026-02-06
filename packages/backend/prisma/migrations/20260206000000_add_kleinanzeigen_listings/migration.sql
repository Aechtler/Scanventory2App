-- AlterTable
ALTER TABLE "ScannedItem" ADD COLUMN "kleinanzeigenListings" JSONB;
ALTER TABLE "ScannedItem" ADD COLUMN "kleinanzeigenListingsFetchedAt" TIMESTAMP(3);

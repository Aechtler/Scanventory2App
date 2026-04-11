-- AlterTable: Listing — Order-Felder für Post-Sale Workflow
ALTER TABLE "Listing"
    ADD COLUMN "externalId"    TEXT,
    ADD COLUMN "ebayOrderId"   TEXT,
    ADD COLUMN "buyerInfo"     JSONB,
    ADD COLUMN "paymentStatus" TEXT;

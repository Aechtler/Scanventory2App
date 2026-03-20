-- Add compound index for user-scoped scanned-item timeline queries
CREATE INDEX "ScannedItem_userId_scannedAt_idx" ON "ScannedItem"("userId", "scannedAt");

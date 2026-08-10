-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "sortOrder" BIGINT NOT NULL DEFAULT 0;

-- Backfill existing rows so untouched "Custom order" starts out
-- newest-first, matching the default sort, instead of an arbitrary tie.
UPDATE "Transaction"
SET "sortOrder" = -(EXTRACT(EPOCH FROM "createdAt") * 1000)::bigint;

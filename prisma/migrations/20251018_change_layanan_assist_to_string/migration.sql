-- AlterTable
-- Migrate existing INT values to STRING format before changing column type
-- Backup existing data as string
UPDATE "prospek" SET "layananAssistId" = CAST("layananAssistId" AS TEXT) WHERE "layananAssistId" IS NOT NULL;

-- Change column type from INT to TEXT
ALTER TABLE "prospek" ALTER COLUMN "layananAssistId" TYPE TEXT USING "layananAssistId"::TEXT;

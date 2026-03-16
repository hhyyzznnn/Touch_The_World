-- Inquiry source tracking fields for AI consulting conversion
ALTER TABLE "Inquiry"
ADD COLUMN IF NOT EXISTS "sourceType" TEXT;

UPDATE "Inquiry"
SET "sourceType" = 'manual'
WHERE "sourceType" IS NULL;

ALTER TABLE "Inquiry"
ALTER COLUMN "sourceType" SET DEFAULT 'manual';

ALTER TABLE "Inquiry"
ALTER COLUMN "sourceType" SET NOT NULL;

ALTER TABLE "Inquiry"
ADD COLUMN IF NOT EXISTS "sourceSessionId" TEXT;

ALTER TABLE "Inquiry"
ADD COLUMN IF NOT EXISTS "consultingLogId" TEXT;

ALTER TABLE "Inquiry"
ADD COLUMN IF NOT EXISTS "autoCreated" BOOLEAN DEFAULT FALSE;

UPDATE "Inquiry"
SET "autoCreated" = FALSE
WHERE "autoCreated" IS NULL;

ALTER TABLE "Inquiry"
ALTER COLUMN "autoCreated" SET DEFAULT FALSE;

ALTER TABLE "Inquiry"
ALTER COLUMN "autoCreated" SET NOT NULL;

ALTER TABLE "Inquiry"
ADD COLUMN IF NOT EXISTS "aiSummary" TEXT;

CREATE INDEX IF NOT EXISTS "Inquiry_sourceType_idx"
ON "Inquiry" ("sourceType");

CREATE INDEX IF NOT EXISTS "Inquiry_sourceSessionId_idx"
ON "Inquiry" ("sourceSessionId");

CREATE INDEX IF NOT EXISTS "Inquiry_consultingLogId_idx"
ON "Inquiry" ("consultingLogId");

CREATE INDEX IF NOT EXISTS "Inquiry_autoCreated_idx"
ON "Inquiry" ("autoCreated");

CREATE UNIQUE INDEX IF NOT EXISTS "Inquiry_sourceSessionId_key"
ON "Inquiry" ("sourceSessionId")
WHERE "sourceSessionId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Inquiry_consultingLogId_key"
ON "Inquiry" ("consultingLogId")
WHERE "consultingLogId" IS NOT NULL;

-- ConsultingLog fields for conversion status and schedule
ALTER TABLE "ConsultingLog"
ADD COLUMN IF NOT EXISTS "expectedDate" TEXT;

ALTER TABLE "ConsultingLog"
ADD COLUMN IF NOT EXISTS "convertedToInquiry" BOOLEAN DEFAULT FALSE;

UPDATE "ConsultingLog"
SET "convertedToInquiry" = FALSE
WHERE "convertedToInquiry" IS NULL;

ALTER TABLE "ConsultingLog"
ALTER COLUMN "convertedToInquiry" SET DEFAULT FALSE;

ALTER TABLE "ConsultingLog"
ALTER COLUMN "convertedToInquiry" SET NOT NULL;

ALTER TABLE "ConsultingLog"
ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ConsultingLog_convertedToInquiry_idx"
ON "ConsultingLog" ("convertedToInquiry");

-- NOTE:
-- run-sql 스크립트는 DO $$ 블록 파싱을 지원하지 않으므로,
-- 아래 FK는 별도 SQL 파일(scripts/sql/add_inquiry_consultinglog_fk.sql)로 실행합니다.

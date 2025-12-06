-- Event 테이블에 status와 notes 컬럼 추가
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'in_progress';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- status 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status");

-- 기존 데이터의 status를 'in_progress'로 설정 (NULL인 경우)
UPDATE "Event" SET "status" = 'in_progress' WHERE "status" IS NULL;
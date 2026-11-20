-- 문의 삭제 → 보관함 (2026-11-20). 기존 행은 그대로, 칸만 추가.
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Inquiry_archivedAt_idx" ON "Inquiry"("archivedAt");

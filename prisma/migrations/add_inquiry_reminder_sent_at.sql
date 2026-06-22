-- Inquiry 테이블에 리마인더 발송 추적 컬럼 추가

ALTER TABLE "Inquiry"
  ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Inquiry_reminderSentAt_idx" ON "Inquiry"("reminderSentAt");

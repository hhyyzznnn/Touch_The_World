-- 2026-11-05 나라장터 입찰 알림: 첨부 공고문 AI 요약 저장 (lib/g2b-summary.ts)
ALTER TABLE "G2BNotice" ADD COLUMN IF NOT EXISTS "aiSummary" JSONB;

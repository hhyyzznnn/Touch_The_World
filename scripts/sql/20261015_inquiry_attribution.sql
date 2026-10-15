-- 문의 유입 경로 (lib/attribution.ts) — 처음·마지막으로 바깥에서 들어온 경로
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "attribution" JSONB;

-- 회사 소식(CompanyNews) 테이블 생성
-- Supabase SQL Editor에서 실행: 이 파일 내용 복사 후 Run

-- 테이블 생성 (이미 있으면 스킵)
CREATE TABLE IF NOT EXISTS "CompanyNews" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "title"     TEXT NOT NULL,
  "summary"   TEXT,
  "content"   TEXT,
  "link"       TEXT,
  "isPinned"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 (이미 있으면 에러 나므로 무시하거나 아래 한 줄씩 실행)
CREATE INDEX IF NOT EXISTS "CompanyNews_isPinned_idx" ON "CompanyNews"("isPinned");
CREATE INDEX IF NOT EXISTS "CompanyNews_createdAt_idx" ON "CompanyNews"("createdAt");

-- updatedAt 자동 갱신 (선택)
-- CREATE OR REPLACE FUNCTION update_company_news_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW."updatedAt" = CURRENT_TIMESTAMP;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- DROP TRIGGER IF EXISTS company_news_updated_at ON "CompanyNews";
-- CREATE TRIGGER company_news_updated_at
--   BEFORE UPDATE ON "CompanyNews"
--   FOR EACH ROW EXECUTE FUNCTION update_company_news_updated_at();

-- ===================================================
-- Supabase SQL Editor에서 직접 실행하세요 (순서대로)
-- ===================================================

-- 1. enum 타입 생성
CREATE TYPE "CompanyNewsType" AS ENUM ('COMPANY_NEWS', 'PROGRAM_CARD_NEWS');

-- 2. type 컬럼 추가
ALTER TABLE "CompanyNews"
  ADD COLUMN "type" "CompanyNewsType" NOT NULL DEFAULT 'COMPANY_NEWS';

-- 3. category 컬럼 추가
ALTER TABLE "CompanyNews"
  ADD COLUMN "category" TEXT;

-- 4. 인덱스 추가
CREATE INDEX "CompanyNews_type_idx" ON "CompanyNews"("type");
CREATE INDEX "CompanyNews_type_category_idx" ON "CompanyNews"("type", "category");

-- 5. 기존 데이터 타입 분류
--    이미지가 있는 것 → PROGRAM_CARD_NEWS
UPDATE "CompanyNews"
SET "type" = 'PROGRAM_CARD_NEWS'
WHERE "imageUrls" != '{}'
   OR "imageUrl" IS NOT NULL;

-- 결과 확인
SELECT "type", COUNT(*) FROM "CompanyNews" GROUP BY "type";

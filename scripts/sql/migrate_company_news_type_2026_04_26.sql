-- CompanyNews 타입 분리 마이그레이션 (2026-04-26)
-- 실행 전: prisma migrate dev 또는 db:push 로 스키마를 먼저 반영하세요.
--
-- imageUrls가 있거나 imageUrl이 있는 기존 레코드 → PROGRAM_CARD_NEWS
-- 이미지가 없는 텍스트 전용 레코드 → COMPANY_NEWS (기본값이므로 별도 처리 불필요)

UPDATE "CompanyNews"
SET type = 'PROGRAM_CARD_NEWS'
WHERE "imageUrls" != '{}'
   OR "imageUrl" IS NOT NULL;

-- 확인 쿼리
SELECT type, COUNT(*) FROM "CompanyNews" GROUP BY type;

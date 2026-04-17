-- CompanyNews 카드뉴스 상세 이미지 URL 배열 컬럼 추가
ALTER TABLE "CompanyNews"
ADD COLUMN IF NOT EXISTS "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

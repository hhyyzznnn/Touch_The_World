-- CompanyNews 카드뉴스 이미지 URL 컬럼 추가
ALTER TABLE "CompanyNews"
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

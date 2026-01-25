-- Program 테이블 인덱스 추가 마이그레이션
-- 정렬 및 검색 성능 최적화를 위한 인덱스 추가

-- rating 인덱스 (평점순 정렬용)
CREATE INDEX IF NOT EXISTS "Program_rating_idx" ON "Program"("rating");

-- reviewCount 인덱스 (인기순 정렬용)
CREATE INDEX IF NOT EXISTS "Program_reviewCount_idx" ON "Program"("reviewCount");

-- priceFrom 인덱스 (가격순 정렬용)
CREATE INDEX IF NOT EXISTS "Program_priceFrom_idx" ON "Program"("priceFrom");

-- createdAt 인덱스 (최신순 정렬용, 이미 있을 수 있음)
CREATE INDEX IF NOT EXISTS "Program_createdAt_idx" ON "Program"("createdAt");

-- title 인덱스 (이름순 정렬용)
CREATE INDEX IF NOT EXISTS "Program_title_idx" ON "Program"("title");

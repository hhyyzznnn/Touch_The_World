-- 카드뉴스 카테고리 일괄 지정 (2026-05-25)
-- imageUrl slug 패턴으로 각 카드뉴스를 식별해 category를 부여합니다.
-- 카테고리는 PROGRAM_CATEGORIES 목록과 정확히 일치해야 필터가 동작합니다.

-- 1) type 보정: 이미지가 있는데 COMPANY_NEWS인 항목 → PROGRAM_CARD_NEWS
UPDATE "CompanyNews"
SET "type" = 'PROGRAM_CARD_NEWS'
WHERE ("imageUrls" != '{}' OR "imageUrl" IS NOT NULL)
  AND "type" = 'COMPANY_NEWS';

-- 2) 카테고리 지정
--    국내외 교육여행
UPDATE "CompanyNews" SET "category" = '국내외 교육여행'
WHERE "imageUrl" LIKE '%japan-edu-trip-2026%'
   OR "imageUrl" LIKE '%japan-education-trip-recommended-programs-2026%'
   OR "imageUrl" LIKE '%korea-japan-school-exchange-matching%'
   OR "imageUrl" LIKE '%inspire-resort-incheon-education-trip-2026%';

--    교사 연수
UPDATE "CompanyNews" SET "category" = '교사 연수'
WHERE "imageUrl" LIKE '%staff-training-incheon-custom%'
   OR "imageUrl" LIKE '%teacher-training-domestic-overseas-program%'
   OR "imageUrl" LIKE '%seoul-gyeonggi-teacher-training-accommodations-2026%';

--    특성화고 프로그램
UPDATE "CompanyNews" SET "category" = '특성화고 프로그램'
WHERE "imageUrl" LIKE '%specialized-highschool-global-field-study-2026%'
   OR "imageUrl" LIKE '%specialized-highschool-custom-career-program%'
   OR "imageUrl" LIKE '%specialized-highschool-future-talent-project-2026%'
   OR "imageUrl" LIKE '%webtoon-custom-japan-education-trip%';

--    해외 취업 및 유학
UPDATE "CompanyNews" SET "category" = '해외 취업 및 유학'
WHERE "imageUrl" LIKE '%overseas-employment-study-abroad-program%';

--    기타 프로그램
UPDATE "CompanyNews" SET "category" = '기타 프로그램'
WHERE "imageUrl" LIKE '%touch-the-world-company-introduction-2026%'
   OR "imageUrl" LIKE '%ceo-park-jungju-introduction%'
   OR "imageUrl" LIKE '%education-trip-tour-leader-recruitment-2026%';

-- 3) upload-card-news.ts에서 잘못 입력된 '특성화고교 프로그램' → 정정
UPDATE "CompanyNews" SET "category" = '특성화고 프로그램'
WHERE "category" = '특성화고교 프로그램';

-- 결과 확인
SELECT "category", COUNT(*) AS count
FROM "CompanyNews"
WHERE "type" = 'PROGRAM_CARD_NEWS'
GROUP BY "category"
ORDER BY count DESC;

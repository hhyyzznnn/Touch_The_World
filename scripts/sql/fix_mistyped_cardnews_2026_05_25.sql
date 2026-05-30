-- 프로그램 탭에 잘못 올라간 카드뉴스 → 회사 소식으로 타입 변경 (2026-05-25)
--
-- 기준: 모집 공고·기획안 등 "회사 소식" 성격인 게시물이
--       실수로 PROGRAM_CARD_NEWS 타입으로 등록된 경우
--
-- 변경 대상
--   1. AI 에이전트 창업프로그램 모집 공고
--   2. 전북 공업계열 인천교육여행 기획안

UPDATE "CompanyNews"
SET
  "type"     = 'COMPANY_NEWS',
  "category" = NULL,
  "updatedAt" = NOW()
WHERE
  "title" LIKE '%창업프로그램%모집%'
  OR "title" LIKE '%학생창업%'
  OR "title" LIKE '%공업계열%기획안%'
  OR "title" LIKE '%공업계열%인천교육여행%';

-- 결과 확인
SELECT "id", "type", "category", "title"
FROM "CompanyNews"
WHERE
  "title" LIKE '%창업프로그램%모집%'
  OR "title" LIKE '%학생창업%'
  OR "title" LIKE '%공업계열%기획안%'
  OR "title" LIKE '%공업계열%인천교육여행%';

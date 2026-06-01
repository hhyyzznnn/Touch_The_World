-- "공고계열" → "공업계열" 용어 정정 (2026-06-01)
-- Supabase SQL Editor에서 실행하세요.

UPDATE "CompanyNews"
SET
  title   = REPLACE(title,   '공고계열', '공업계열'),
  summary = REPLACE(summary, '공고계열', '공업계열'),
  content = REPLACE(content, '공고계열', '공업계열'),
  "updatedAt" = NOW()
WHERE
  title   LIKE '%공고계열%'
  OR summary LIKE '%공고계열%'
  OR content LIKE '%공고계열%';

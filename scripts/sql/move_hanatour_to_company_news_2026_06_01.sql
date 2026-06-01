-- 하나투어 교직원 혜택 카드뉴스를 회사 소식(COMPANY_NEWS)으로 이동 (2026-06-01)
-- Supabase SQL Editor에서 실행하세요.

UPDATE "CompanyNews"
SET
  type        = 'COMPANY_NEWS',
  "updatedAt" = NOW()
WHERE id = 'cardnews_hanatour_teacher_benefits_2026';

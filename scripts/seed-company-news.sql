-- 샘플 회사 소식 1건 추가 (메인 페이지 티커에 노출)
-- Supabase SQL Editor에서 실행 (CompanyNews 테이블이 있어야 함)

INSERT INTO "CompanyNews" (
  "id",
  "title",
  "summary",
  "content",
  "link",
  "isPinned",
  "createdAt",
  "updatedAt"
) VALUES (
  'clr5companynews0000000000001',
  '교육여행부문 인천시장상 수상',
  '터치더월드가 교육여행부문 인천시장상을 수상했습니다.',
  '터치더월드는 교육여행부문 인천시장상을 수상했습니다. 앞으로도 안전하고 완성도 높은 교육여행 프로그램으로 보답하겠습니다.',
  NULL,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

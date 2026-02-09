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
  '인천관광공사 00상을 수상했습니다.',
  '인천관광공사가 주관하는 00상을 수상하였습니다.',
  '터치더월드는 인천관광공사가 주관하는 00상을 수상하였습니다. 앞으로도 더 좋은 프로그램으로 찾아뵙겠습니다.',
  NULL,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

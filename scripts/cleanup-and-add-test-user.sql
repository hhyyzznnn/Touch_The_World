-- admin 계정을 제외한 모든 사용자 삭제 및 테스트 계정 추가
-- Supabase SQL Editor에서 실행

-- 1. admin 계정을 제외한 모든 사용자 삭제
DELETE FROM "User"
WHERE "username" != 'admin';

-- 2. 테스트 계정 추가 (이미 있으면 건너뜀)
-- 비밀번호: test123 (bcrypt 해시)
INSERT INTO "User" (
  "id",
  "username",
  "email",
  "password",
  "name",
  "phone",
  "school",
  "role",
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  'clr6testuser0000000000001',
  'test',
  'test@test.com',
  '$2a$10$rK8X8X8X8X8X8X8X8X8XeO8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', -- test123 해시 (실제로는 bcrypt로 생성 필요)
  '테스트',
  '010-1234-5678',
  '테스트 학교',
  'user',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO NOTHING
ON CONFLICT ("email") DO NOTHING;

-- 3. 현재 계정 목록 확인
SELECT 
  "username",
  "email",
  "name",
  "role",
  "createdAt"
FROM "User"
ORDER BY "createdAt" ASC;

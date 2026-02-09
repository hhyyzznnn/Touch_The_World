-- 테스트 계정 생성 (Supabase SQL Editor에서 실행)
-- pgcrypto로 비밀번호 bcrypt 해시 생성
-- 아이디: test / 비밀번호: test1234

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "User" (
  id,
  username,
  email,
  password,
  name,
  phone,
  school,
  role,
  "emailVerified",
  "phoneVerified",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'test',
  'test@test.com',
  crypt('test1234', gen_salt('bf')),
  '테스트',
  '010-0000-0000',
  '테스트 학교',
  'user',
  true,
  false,
  now(),
  now()
)
ON CONFLICT (username) DO UPDATE SET
  "emailVerified" = true,
  "password" = crypt('test1234', gen_salt('bf')),
  "updatedAt" = now();

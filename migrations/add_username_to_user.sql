-- User 테이블에 username 컬럼 추가 및 기존 데이터 정리

-- 1. username 컬럼 추가 (NULL 허용, 나중에 NOT NULL로 변경)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- 2. 기존 계정들에 username 설정
-- Admin 계정
UPDATE "User"
SET "username" = 'admin'
WHERE ("username" IS NULL OR "username" = '')
  AND (email = 'admin@example.com' OR role = 'admin')
  AND NOT EXISTS (SELECT 1 FROM "User" u2 WHERE u2.username = 'admin' AND u2.id != "User".id);

-- 테스트 계정 1
UPDATE "User"
SET "username" = 'testuser1'
WHERE ("username" IS NULL OR "username" = '')
  AND email = 'test1@example.com'
  AND NOT EXISTS (SELECT 1 FROM "User" u2 WHERE u2.username = 'testuser1' AND u2.id != "User".id);

-- 테스트 계정 2
UPDATE "User"
SET "username" = 'testuser2'
WHERE ("username" IS NULL OR "username" = '')
  AND email = 'test2@example.com'
  AND NOT EXISTS (SELECT 1 FROM "User" u2 WHERE u2.username = 'testuser2' AND u2.id != "User".id);

-- 3. 이메일이 있는 다른 계정들은 이메일의 @ 앞부분을 username으로 사용
UPDATE "User"
SET "username" = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9]', '', 'g'))
WHERE ("username" IS NULL OR "username" = '')
  AND email IS NOT NULL
  AND LENGTH(LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-z0-9]', '', 'g'))) >= 3;

-- 4. username이 여전히 NULL인 경우 기본값 생성 (id의 앞부분 사용)
UPDATE "User"
SET "username" = 'user' || SUBSTRING(id, 1, 8)
WHERE "username" IS NULL OR "username" = '';

-- 5. username에 유니크 제약 조건 추가
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- 6. username에 인덱스 추가 (이미 스키마에 정의되어 있지만 확인)
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");

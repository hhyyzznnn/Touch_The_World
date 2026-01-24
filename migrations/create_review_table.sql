-- Review 테이블 생성 마이그레이션
-- 후기 기능을 위한 테이블 및 인덱스 생성

-- Review 테이블 생성
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- 외래 키 제약 조건 추가
ALTER TABLE "Review" ADD CONSTRAINT "Review_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 유니크 제약 조건 추가 (한 사용자는 한 프로그램에 하나의 후기만 작성 가능)
CREATE UNIQUE INDEX IF NOT EXISTS "Review_programId_userId_key" ON "Review"("programId", "userId");

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS "Review_programId_idx" ON "Review"("programId");
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");
CREATE INDEX IF NOT EXISTS "Review_createdAt_idx" ON "Review"("createdAt");
CREATE INDEX IF NOT EXISTS "Review_rating_idx" ON "Review"("rating");

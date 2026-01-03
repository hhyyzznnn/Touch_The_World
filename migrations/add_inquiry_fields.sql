-- Inquiry 테이블에 상세 필드 추가
-- 실행 방법: Supabase SQL Editor에서 이 코드를 복사하여 실행하세요

ALTER TABLE "Inquiry" 
ADD COLUMN IF NOT EXISTS "expectedDate" TEXT,
ADD COLUMN IF NOT EXISTS "participantCount" INTEGER,
ADD COLUMN IF NOT EXISTS "purpose" TEXT,
ADD COLUMN IF NOT EXISTS "hasInstructor" BOOLEAN,
ADD COLUMN IF NOT EXISTS "preferredTransport" TEXT,
ADD COLUMN IF NOT EXISTS "mealPreference" TEXT,
ADD COLUMN IF NOT EXISTS "specialRequests" TEXT,
ADD COLUMN IF NOT EXISTS "estimatedBudget" INTEGER;


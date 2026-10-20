-- 교사 멤버십 1단계(무료 기본 + 시범 운영 신청) 가입자
CREATE TABLE IF NOT EXISTS "MembershipMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "schoolName" TEXT NOT NULL,
  "position" TEXT,
  "schoolLevel" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "interests" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "tier" TEXT NOT NULL DEFAULT 'basic',
  "pilotInterest" BOOLEAN NOT NULL DEFAULT false,
  "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
  "newsletterOptInAt" TIMESTAMP(3),
  "privacyConsentAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  "attribution" JSONB,
  "memo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "MembershipMember_email_key" ON "MembershipMember"("email");
CREATE INDEX IF NOT EXISTS "MembershipMember_tier_idx" ON "MembershipMember"("tier");
CREATE INDEX IF NOT EXISTS "MembershipMember_createdAt_idx" ON "MembershipMember"("createdAt");

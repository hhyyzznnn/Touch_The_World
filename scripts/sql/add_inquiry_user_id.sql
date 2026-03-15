-- Inquiry.userId nullable column + index + FK
ALTER TABLE "Inquiry"
ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE INDEX IF NOT EXISTS "Inquiry_userId_idx"
ON "Inquiry" ("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Inquiry_userId_fkey'
  ) THEN
    ALTER TABLE "Inquiry"
    ADD CONSTRAINT "Inquiry_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

-- Optional backfill using email match for existing rows
UPDATE "Inquiry" i
SET "userId" = u.id
FROM "User" u
WHERE i."userId" IS NULL
  AND i.email = u.email
  AND u.email IS NOT NULL;

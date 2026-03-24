-- Product 다중 이미지 테이블 추가
CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductImage_productId_fkey"
    FOREIGN KEY ("productId")
    REFERENCES "Product"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx"
ON "ProductImage" ("productId");

-- 기존 Product.imageUrl 데이터 백필
INSERT INTO "ProductImage" ("id", "productId", "url")
SELECT
  CONCAT('legacy_', md5(p."id" || ':' || p."imageUrl")),
  p."id",
  p."imageUrl"
FROM "Product" p
WHERE p."imageUrl" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "ProductImage" pi
    WHERE pi."productId" = p."id"
      AND pi."url" = p."imageUrl"
  );

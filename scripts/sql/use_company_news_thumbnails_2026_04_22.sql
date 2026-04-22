UPDATE "CompanyNews"
SET
  "imageUrl" = regexp_replace("imageUrl", '/01\.webp$', '/thumbnail.webp'),
  "updatedAt" = NOW()
WHERE "imageUrl" LIKE '/company-news/%/01.webp';

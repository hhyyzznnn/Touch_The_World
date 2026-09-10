/**
 * CompanyNews.category(단일) → categories(배열) 마이그레이션 실행 스크립트.
 * prisma/migrations/add_companynews_categories_array.sql 내용을 직접 적용한다.
 * 이 시점의 실제 DB는 스키마 변경이 진행 중인 과도기 상태라 $executeRawUnsafe로 직접 접근한다.
 */
import { config } from "dotenv";
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";

const connectionUrl = process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: connectionUrl } } });

async function main() {
  console.log("1) categories 컬럼 추가...");
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "CompanyNews" ADD COLUMN IF NOT EXISTS "categories" TEXT[] NOT NULL DEFAULT '{}'`
  );

  console.log("2) 기존 category 값 백필...");
  const backfilled = await prisma.$executeRawUnsafe(
    `UPDATE "CompanyNews" SET "categories" = ARRAY["category"] WHERE "category" IS NOT NULL AND "category" <> '' AND "categories" = '{}'`
  );
  console.log(`   ${backfilled}건 백필 완료`);

  console.log("3) 기존 (type, category) 인덱스 제거...");
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "CompanyNews_type_category_idx"`);

  console.log("4) category 컬럼 삭제...");
  await prisma.$executeRawUnsafe(`ALTER TABLE "CompanyNews" DROP COLUMN IF EXISTS "category"`);

  console.log("✅ 마이그레이션 완료");
}

main()
  .catch((e) => {
    console.error("❌ 오류:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

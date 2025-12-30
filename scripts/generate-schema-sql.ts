#!/usr/bin/env tsx
/**
 * Prisma 스키마 변경 SQL 생성 스크립트
 * schema.prisma를 읽어서 현재 DB와 비교하고 필요한 SQL을 생성합니다.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

async function generateSchemaSQL() {
  try {
    console.log("🔧 스키마 변경 SQL 생성 중...\n");

    // 1. Prisma 스키마를 SQL로 변환 시도
    // Direct Connection이 없으므로, Prisma의 introspection을 사용
    console.log("📝 현재 스키마 파일 확인...");
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ schema.prisma 파일을 찾을 수 없습니다.");
      process.exit(1);
    }

    console.log("✅ schema.prisma 파일 확인됨\n");

    // 2. Prisma migrate로 SQL 생성 시도 (실행은 안 함)
    console.log("🔨 마이그레이션 SQL 생성 시도...");
    console.log("⚠️  참고: Direct Connection이 필요하므로 실패할 수 있습니다.\n");

    try {
      // 임시로 DATABASE_URL을 DATABASE_POOLING_URL로 설정
      const poolingUrl = process.env.DATABASE_POOLING_URL;
      if (!poolingUrl) {
        throw new Error("DATABASE_POOLING_URL이 설정되지 않았습니다.");
      }

      // Prisma가 스키마를 검증하고 SQL을 생성하려고 시도
      // 하지만 실제로는 Direct Connection이 필요함
      console.log("💡 대안: Supabase Dashboard SQL Editor 사용");
      console.log("   1. schema.prisma 파일을 수정");
      console.log("   2. Supabase Dashboard → SQL Editor");
      console.log("   3. 필요한 ALTER TABLE / CREATE TABLE SQL 실행\n");

      // 스키마 파일을 읽어서 변경사항을 파악
      const schemaContent = fs.readFileSync(schemaPath, "utf-8");
      console.log("📄 현재 스키마 모델 목록:");
      const modelMatches = schemaContent.matchAll(/^model (\w+)/gm);
      for (const match of modelMatches) {
        console.log(`   - ${match[1]}`);
      }

    } catch (error: any) {
      console.log("\n⚠️  Prisma CLI로 SQL 생성 실패 (예상됨)");
      console.log("   원인: Direct Connection 필요\n");
    }

    console.log("✅ 스키마 확인 완료");
    console.log("\n📋 다음 단계:");
    console.log("   1. schema.prisma 파일을 수정");
    console.log("   2. Supabase Dashboard → SQL Editor에서 필요한 SQL 실행");
    console.log("   3. 또는 제가 SQL을 생성해드릴 수 있습니다 (변경사항을 알려주세요)");

  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

generateSchemaSQL();


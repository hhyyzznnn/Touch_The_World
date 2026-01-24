/**
 * Review 테이블 SQL 마이그레이션 스크립트
 * 
 * 이 스크립트는 SQL 파일을 읽어서 데이터베이스에 직접 실행합니다.
 * cleanup-database.ts와 동일한 방식으로 환경 변수를 처리합니다.
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

// .env 파일에서 직접 읽기 (cleanup-database.ts와 동일한 방식)
function loadEnv() {
  try {
    const envFile = readFileSync(".env", "utf-8");
    const lines = envFile.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          process.env[key.trim()] = value.trim();
        }
      }
    }
  } catch (error) {
    console.warn("⚠️  .env 파일을 읽을 수 없습니다:", error);
  }
}

// .env 파일 로드
loadEnv();

// DATABASE_POOLING_URL 환경 변수 사용 (cleanup-database.ts와 동일)
const databaseUrl = process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL 또는 DATABASE_POOLING_URL 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function migrateReviews() {
  console.log("🔄 Review 테이블 SQL 마이그레이션 시작...\n");

  try {
    // SQL 파일 읽기
    const sqlPath = join(process.cwd(), "migrations", "create_review_table.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    // SQL 문을 세미콜론으로 분리하고 정리
    const lines = sql.split("\n");
    const statements: string[] = [];
    let currentStatement = "";

    for (const line of lines) {
      const trimmed = line.trim();
      // 주석 제거
      if (trimmed.startsWith("--")) continue;
      
      currentStatement += (currentStatement ? " " : "") + trimmed;
      
      // 세미콜론으로 문장 종료
      if (trimmed.endsWith(";")) {
        const cleaned = currentStatement.replace(/;$/, "").trim();
        if (cleaned) {
          statements.push(cleaned);
        }
        currentStatement = "";
      }
    }

    // 마지막 문장 처리
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📝 ${statements.length}개의 SQL 문 실행 중...\n`);

    // 각 SQL 문 실행
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`실행 중: ${statement.substring(0, 50)}...`);
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ ${i + 1}/${statements.length} 완료\n`);
        } catch (error: any) {
          // 이미 존재하는 경우 무시 (IF NOT EXISTS)
          if (
            error.message?.includes("already exists") ||
            error.message?.includes("duplicate") ||
            error.message?.includes("does not exist") && statement.includes("IF NOT EXISTS")
          ) {
            console.log(`⚠️  ${i + 1}/${statements.length} 이미 존재함 (건너뜀)\n`);
          } else {
            console.error(`❌ ${i + 1}/${statements.length} 실패:`, error.message);
            console.error(`실패한 SQL: ${statement.substring(0, 100)}...`);
            throw error;
          }
        }
      }
    }

    console.log("\n✅ 마이그레이션 완료!");
    console.log("\n💡 이제 후기 기능을 사용할 수 있습니다:");
    console.log("   - 프로그램 상세 페이지에서 후기 작성");
    console.log("   - 마이페이지에서 통계 및 활동 내역 확인");
    console.log("   - /my-reviews에서 작성한 후기 관리");
  } catch (error) {
    console.error("\n❌ 마이그레이션 실패:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
migrateReviews()
  .then(() => {
    console.log("\n✅ 스크립트 실행 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 스크립트 실행 실패:", error);
    process.exit(1);
  });

/**
 * User 테이블에 username 컬럼 추가 및 기존 데이터 정리 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * 1. username 컬럼 추가
 * 2. 기존 계정들에 username 설정
 * 3. 유니크 인덱스 및 인덱스 생성
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

// .env 파일에서 직접 읽기
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

loadEnv();

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

async function addUsernameColumn() {
  console.log("🔄 username 컬럼 추가 및 데이터 정리 시작...\n");

  try {
    // SQL 파일 읽기
    const sqlPath = join(process.cwd(), "migrations", "add_username_to_user.sql");
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
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ ${i + 1}/${statements.length} 완료`);
        } catch (error: any) {
          // 이미 존재하는 경우 무시
          if (
            error.message?.includes("already exists") ||
            error.message?.includes("duplicate") ||
            error.message?.includes("does not exist") && statement.includes("IF NOT EXISTS")
          ) {
            console.log(`⚠️  ${i + 1}/${statements.length} 이미 존재함 (건너뜀)`);
          } else {
            console.error(`❌ ${i + 1}/${statements.length} 실패:`, error.message);
            // 컬럼 추가 실패는 무시 (이미 존재할 수 있음)
            if (!statement.includes("ADD COLUMN")) {
              throw error;
            }
          }
        }
      }
    }

    // 최종 확인
    const users: any[] = await prisma.$queryRaw`
      SELECT id, username, email, name, role 
      FROM "User" 
      ORDER BY "createdAt" ASC
    `;

    console.log("\n📊 최종 사용자 목록:");
    users.forEach((user: any, index: number) => {
      const roleBadge = user.role === "admin" ? "👑" : "👤";
      console.log(`   ${index + 1}. ${roleBadge} ${user.name}`);
      console.log(`      - 아이디: ${user.username || "없음"}`);
      console.log(`      - 이메일: ${user.email || "없음"}`);
      console.log(`      - 역할: ${user.role}\n`);
    });

    console.log("✨ username 컬럼 추가 및 데이터 정리 완료!");
  } catch (error: any) {
    console.error("❌ 오류 발생:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addUsernameColumn()
  .then(() => {
    console.log("\n✅ 스크립트 실행 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 스크립트 실행 실패:", error);
    process.exit(1);
  });

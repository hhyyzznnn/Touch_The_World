/**
 * Review 모델 마이그레이션 스크립트
 * 
 * 이 스크립트는 Prisma 스키마를 데이터베이스에 적용합니다.
 * Review 테이블과 관련 관계를 생성합니다.
 * 
 * 사용법: npm run db:migrate:reviews
 */

import { readFileSync } from "fs";

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

console.log("🔄 Review 모델 마이그레이션 안내\n");
console.log("다음 명령어를 직접 실행해주세요:\n");
console.log(`DATABASE_URL="${databaseUrl}" npx prisma db push\n`);
console.log("또는:\n");
console.log(`export DATABASE_URL="${databaseUrl}"`);
console.log("npx prisma db push\n");
console.log("마이그레이션이 완료되면:");
console.log("✅ 프로그램 상세 페이지에서 후기 작성 가능");
console.log("✅ 마이페이지에서 통계 및 활동 내역 확인 가능");
console.log("✅ /my-reviews에서 작성한 후기 관리 가능");

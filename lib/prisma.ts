import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * 데이터베이스 URL 선택
 * 
 * 런타임 환경(Next.js 서버리스)에서는 Connection Pooler URL을 사용해야 합니다.
 * - DATABASE_POOLING_URL: pgbouncer를 통한 연결 (포트 6543) - 런타임용
 * - DATABASE_URL: Direct Connection (포트 5432) - CLI용 (prisma migrate, db push 등)
 * 
 * 참고: prisma/schema.prisma는 DATABASE_URL을 사용하므로,
 * CLI 명령어는 자동으로 Direct Connection을 사용합니다.
 */
function getDatabaseUrl(): string {
  // 런타임 환경에서는 Pooler URL 우선 사용
  if (process.env.DATABASE_POOLING_URL) {
    return process.env.DATABASE_POOLING_URL;
  }
  
  // 폴백: DATABASE_URL (개발 환경에서만 사용)
  if (process.env.DATABASE_URL) {
    // 경고: 프로덕션에서는 Pooler URL을 사용해야 함
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️  DATABASE_POOLING_URL이 설정되지 않았습니다. " +
        "프로덕션 환경에서는 Connection Pooler를 사용해야 합니다."
      );
    }
    return process.env.DATABASE_URL;
  }
  
  throw new Error(
    "DATABASE_URL 또는 DATABASE_POOLING_URL 환경 변수가 설정되지 않았습니다."
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

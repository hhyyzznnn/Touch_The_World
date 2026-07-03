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
  const base =
    process.env.DATABASE_POOLING_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_DIRECT_URL;

  if (!base) {
    throw new Error(
      "DATABASE_URL, DATABASE_POOLING_URL 또는 DATABASE_DIRECT_URL 환경 변수가 설정되지 않았습니다."
    );
  }

  // 서버리스 환경에서 불필요한 커넥션 풀 낭비 방지
  const url = new URL(base);
  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "1");
  }
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
  }));

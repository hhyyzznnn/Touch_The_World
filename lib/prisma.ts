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

  // 연결 개수: 예전엔 1개로 강제했는데, Vercel(Fluid Compute)은 서버 한 대가 여러 요청을 동시에 받고
  // 프로그램 탭처럼 한 화면이 조회 4개를 한꺼번에 보내서 연결 1개를 기다리다 10초 초과(P2024)가 반복됐다
  // (2026-11 운영 오류 기록, 로컬 재현: 동시 12건 중 9건 실패). Supabase 풀러(6543)가 실제 DB 연결을 나눠 주므로
  // 서버당 5개로 늘리고 대기도 20초까지 허용한다. 환경변수 주소에 값이 있으면 그 값을 그대로 쓴다.
  const url = new URL(base);
  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "5");
  }
  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", "20");
  }
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
  }));

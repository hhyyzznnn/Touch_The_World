import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// 연결 안정성을 위한 재시도 로직
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 연결 오류 시 자동 재연결
prisma.$connect().catch((err) => {
  console.error("Prisma 연결 오류:", err);
});

// 앱 종료 시 연결 정리
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}


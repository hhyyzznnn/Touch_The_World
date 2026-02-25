#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

type NameOnly = { name: string };
type FunctionRow = { function_name: string };

const datasourceUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;

if (!datasourceUrl) {
  console.error("DATABASE_DIRECT_URL 또는 DATABASE_URL 이 필요합니다.");
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl });

async function applyHardening() {
  console.log("Supabase 보안 하드닝 시작\n");

  await prisma.$executeRawUnsafe(`
    REVOKE USAGE, CREATE ON SCHEMA public FROM anon, authenticated;
    REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
  `);

  const tables = await prisma.$queryRaw<NameOnly[]>`
    SELECT c.relname AS name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
    ORDER BY c.relname;
  `;

  for (const table of tables) {
    const escaped = `"${table.name.replace(/"/g, '""')}"`;
    await prisma.$executeRawUnsafe(
      `ALTER TABLE public.${escaped} ENABLE ROW LEVEL SECURITY;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE public.${escaped} FORCE ROW LEVEL SECURITY;`
    );
  }

  const definerFunctions = await prisma.$queryRaw<FunctionRow[]>`
    SELECT p.oid::regprocedure::text AS function_name
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
    ORDER BY 1;
  `;

  for (const fn of definerFunctions) {
    await prisma.$executeRawUnsafe(
      `ALTER FUNCTION ${fn.function_name} SET search_path = public, pg_temp;`
    );
  }

  console.log(`- RLS 적용 테이블: ${tables.length}개`);
  console.log(`- search_path 설정 함수: ${definerFunctions.length}개`);
}

async function main() {
  try {
    await applyHardening();
    console.log("\n완료: 보안 하드닝 적용");
    console.log("다음으로 `npm run db:security:check`로 재점검하세요.");
  } catch (error) {
    console.error("보안 하드닝 실패:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();

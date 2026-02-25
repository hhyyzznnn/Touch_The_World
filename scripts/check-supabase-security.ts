#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

type NameOnly = { name: string };
type TableGrant = { table_name: string; grantee: string; privilege_type: string };
type DefinerFunction = { function_name: string };
type SchemaPrivilege = { role_name: string; has_usage: boolean; has_create: boolean };

const datasourceUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;

if (!datasourceUrl) {
  console.error("DATABASE_DIRECT_URL 또는 DATABASE_URL 이 필요합니다.");
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl });

async function main() {
  try {
    console.log("Supabase 보안 상태 점검 시작\n");

    const tablesWithoutRls = await prisma.$queryRaw<NameOnly[]>`
      SELECT n.nspname || '.' || c.relname AS name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname = 'public'
        AND c.relrowsecurity = false
      ORDER BY 1;
    `;

    const grants = await prisma.$queryRaw<TableGrant[]>`
      SELECT table_name, grantee, privilege_type
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND grantee IN ('anon', 'authenticated')
      ORDER BY table_name, grantee, privilege_type;
    `;

    const schemaPrivileges = await prisma.$queryRaw<SchemaPrivilege[]>`
      SELECT
        r.rolname AS role_name,
        has_schema_privilege(r.rolname, 'public', 'USAGE') AS has_usage,
        has_schema_privilege(r.rolname, 'public', 'CREATE') AS has_create
      FROM pg_roles r
      WHERE r.rolname IN ('anon', 'authenticated')
      ORDER BY r.rolname;
    `;

    const definerWithoutSearchPath = await prisma.$queryRaw<DefinerFunction[]>`
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

    if (tablesWithoutRls.length === 0) {
      console.log("OK: public 스키마 테이블 RLS가 모두 활성화되어 있습니다.");
    } else {
      console.log(`WARN: RLS 비활성 테이블 (${tablesWithoutRls.length}개):`);
      tablesWithoutRls.forEach((row) => console.log(`  - ${row.name}`));
    }

    if (grants.length === 0) {
      console.log("\nOK: anon/authenticated에 직접 부여된 테이블 권한이 없습니다.");
    } else {
      console.log(`\nWARN: anon/authenticated 테이블 권한 (${grants.length}개):`);
      grants.forEach((row) =>
        console.log(`  - ${row.grantee}: ${row.table_name} (${row.privilege_type})`)
      );
    }

    console.log("\npublic 스키마 권한:");
    schemaPrivileges.forEach((row) =>
      console.log(
        `  - ${row.role_name}: USAGE=${row.has_usage ? "Y" : "N"}, CREATE=${row.has_create ? "Y" : "N"}`
      )
    );

    if (definerWithoutSearchPath.length === 0) {
      console.log("\nOK: SECURITY DEFINER 함수 search_path가 모두 설정되어 있습니다.");
    } else {
      console.log(
        `\nWARN: search_path 없는 SECURITY DEFINER 함수 (${definerWithoutSearchPath.length}개):`
      );
      definerWithoutSearchPath.forEach((row) => console.log(`  - ${row.function_name}`));
    }

    const hasIssues =
      tablesWithoutRls.length > 0 ||
      grants.length > 0 ||
      schemaPrivileges.some((row) => row.has_create) ||
      definerWithoutSearchPath.length > 0;

    console.log(
      hasIssues
        ? "\nACTION: 보안 이슈가 발견되었습니다. `npm run db:security:harden` 실행을 권장합니다."
        : "\nOK: 주요 점검 항목에서 보안 이슈를 찾지 못했습니다."
    );
  } catch (error) {
    console.error("보안 점검 실패:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();

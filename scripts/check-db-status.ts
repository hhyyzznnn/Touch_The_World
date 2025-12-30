#!/usr/bin/env tsx
/**
 * 현재 데이터베이스 상태 확인 스크립트
 * Transaction Pooler를 통해 DB 구조를 확인합니다.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL,
});

async function checkDatabaseStatus() {
  try {
    console.log("🔍 데이터베이스 상태 확인 중...\n");

    // 1. 테이블 목록 확인
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log("📊 테이블 목록:");
    tables.forEach((t) => console.log(`  - ${t.table_name}`));
    console.log(`\n총 ${tables.length}개 테이블\n`);

    // 2. 각 테이블의 컬럼 정보
    console.log("📋 테이블 구조:\n");
    for (const table of tables) {
      const columns = await prisma.$queryRaw<Array<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
      }>>`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position;
      `;

      console.log(`\n${table.table_name}:`);
      columns.forEach((col) => {
        const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : "";
        console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }

    // 3. 인덱스 확인
    console.log("\n\n🔑 인덱스 목록:\n");
    const indexes = await prisma.$queryRaw<Array<{
      tablename: string;
      indexname: string;
    }>>`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;

    indexes.forEach((idx) => {
      console.log(`  - ${idx.tablename}.${idx.indexname}`);
    });

    // 4. 외래 키 확인
    console.log("\n\n🔗 외래 키 목록:\n");
    const foreignKeys = await prisma.$queryRaw<Array<{
      table_name: string;
      constraint_name: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }>>`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;

    foreignKeys.forEach((fk) => {
      console.log(
        `  - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`
      );
    });

    console.log("\n✅ 데이터베이스 상태 확인 완료\n");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();


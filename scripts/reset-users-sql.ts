/**
 * 사용자 계정 정리 및 테스트 계정 추가 스크립트 (SQL 버전)
 * 
 * 이 스크립트는 SQL을 직접 실행하여 다음을 수행합니다:
 * 1. admin 계정을 제외한 모든 사용자 계정 삭제
 * 2. 테스트 계정 2개 추가
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import * as bcrypt from "bcryptjs";

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

async function resetUsers() {
  console.log("🔄 사용자 계정 정리 시작...\n");

  try {
    // 1. admin 계정 ID 확인 (SQL로 직접 조회)
    const adminResult: any[] = await prisma.$queryRaw`
      SELECT id, email, name, role 
      FROM "User" 
      WHERE role = 'admin' OR email LIKE '%admin%' OR name LIKE '%관리자%'
    `;

    console.log(`👤 Admin 계정 확인: ${adminResult.length}개`);
    adminResult.forEach((admin: any) => {
      console.log(`   - ${admin.name} (${admin.email || "이메일 없음"})`);
    });

    const adminIds = adminResult.map((u: any) => `'${u.id}'`).join(", ");

    // 2. admin 계정 제외한 모든 사용자 삭제
    if (adminIds) {
      const deleteResult: any = await prisma.$executeRawUnsafe(`
        DELETE FROM "User" 
        WHERE id NOT IN (${adminIds})
      `);
      console.log(`\n🗑️  Admin 계정 제외 사용자 삭제 완료`);
    } else {
      console.log(`\n⚠️  Admin 계정을 찾을 수 없어 모든 사용자를 삭제하지 않습니다.`);
    }

    // 3. 기존 테스트 계정 삭제
    await prisma.$executeRawUnsafe(`
      DELETE FROM "User" 
      WHERE email IN ('test1@example.com', 'test2@example.com')
    `);

    // 4. 테스트 계정 생성
    console.log("\n➕ 테스트 계정 생성 중...");

    const testPassword = await bcrypt.hash("test1234", 10);
    const testPasswordHash = testPassword.replace(/'/g, "''"); // SQL 이스케이프

    // 테스트 계정 1 (username 포함)
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, username, email, password, name, phone, school, role, "emailVerified", "phoneVerified", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        'testuser1',
        'test1@example.com',
        '${testPasswordHash}',
        '테스트 사용자 1',
        '010-1234-5678',
        '테스트 고등학교',
        'user',
        true,
        true,
        NOW(),
        NOW()
      )
    `);

    console.log(`✅ 테스트 계정 1 생성: 테스트 사용자 1`);
    console.log(`   - 아이디: testuser1`);
    console.log(`   - 이메일: test1@example.com`);

    // 테스트 계정 2 (username 포함)
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, username, email, password, name, phone, school, role, "emailVerified", "phoneVerified", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        'testuser2',
        'test2@example.com',
        '${testPasswordHash}',
        '테스트 사용자 2',
        '010-9876-5432',
        '테스트 중학교',
        'user',
        true,
        true,
        NOW(),
        NOW()
      )
    `);

    console.log(`✅ 테스트 계정 2 생성: 테스트 사용자 2`);
    console.log(`   - 아이디: testuser2`);
    console.log(`   - 이메일: test2@example.com`);

    // 5. 최종 상태 확인
    const allUsers: any[] = await prisma.$queryRaw`
      SELECT id, username, email, name, role 
      FROM "User" 
      ORDER BY "createdAt" ASC
    `;

    console.log("\n📊 최종 사용자 목록:");
    allUsers.forEach((user: any, index: number) => {
      const roleBadge = user.role === "admin" ? "👑" : "👤";
      console.log(`   ${index + 1}. ${roleBadge} ${user.name}`);
      console.log(`      - 아이디: ${user.username || "없음"}`);
      console.log(`      - 이메일: ${user.email || "없음"}`);
      console.log(`      - 역할: ${user.role}\n`);
    });

    console.log("💡 테스트 계정 로그인 정보:");
    console.log("   계정 1:");
    console.log("     - 아이디: testuser1");
    console.log("     - 비밀번호: test1234");
    console.log("   계정 2:");
    console.log("     - 아이디: testuser2");
    console.log("     - 비밀번호: test1234");

    console.log("\n✨ 사용자 계정 정리 완료!");
  } catch (error: any) {
    console.error("❌ 오류 발생:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetUsers()
  .then(() => {
    console.log("\n✅ 스크립트 실행 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 스크립트 실행 실패:", error);
    process.exit(1);
  });

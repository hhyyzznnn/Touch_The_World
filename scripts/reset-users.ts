/**
 * 사용자 계정 정리 및 테스트 계정 추가 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * 1. admin 계정을 제외한 모든 사용자 계정 삭제
 * 2. 테스트 계정 2개 추가
 * 
 * 주의: 이 스크립트는 데이터를 영구적으로 삭제합니다.
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import * as bcrypt from "bcryptjs";

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
    // 1. admin 계정 확인 (email이나 name으로도 확인)
    const adminUsers = await prisma.user.findMany({
      where: { 
        OR: [
          { role: "admin" },
          { email: { contains: "admin" } },
          { name: { contains: "관리자" } }
        ]
      },
      select: { id: true, email: true, name: true, role: true },
    });

    console.log(`👤 Admin 계정 확인: ${adminUsers.length}개`);
    adminUsers.forEach((admin) => {
      console.log(`   - ${admin.name} (${admin.email || "이메일 없음"})`);
    });

    // Admin 계정 ID 목록 저장
    const adminIds = adminUsers.map((u) => u.id);

    // 2. admin 계정을 제외한 모든 사용자 삭제
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          notIn: adminIds.length > 0 ? adminIds : ["none"], // adminIds가 비어있으면 아무것도 삭제하지 않음
        },
      },
    });

    console.log(`\n🗑️  Admin 계정 제외 사용자 삭제: ${deleteResult.count}개`);

    // 3. 테스트 계정 생성
    console.log("\n➕ 테스트 계정 생성 중...");

    const testPassword = await bcrypt.hash("test1234", 10);

    // 기존 테스트 계정 확인 및 삭제
    const existingTest1 = await prisma.user.findUnique({
      where: { email: "test1@example.com" },
    });
    if (existingTest1) {
      await prisma.user.delete({ where: { id: existingTest1.id } });
    }

    const existingTest2 = await prisma.user.findUnique({
      where: { email: "test2@example.com" },
    });
    if (existingTest2) {
      await prisma.user.delete({ where: { id: existingTest2.id } });
    }

    // 테스트 계정 생성
    const testUser1 = await prisma.user.create({
      data: {
        username: "testuser1",
        email: "test1@example.com",
        password: testPassword,
        name: "테스트 사용자 1",
        phone: "010-1234-5678",
        school: "테스트 고등학교",
        role: "user",
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log(`✅ 테스트 계정 1 생성: ${testUser1.name} (${testUser1.email})`);

    const testUser2 = await prisma.user.create({
      data: {
        username: "testuser2",
        email: "test2@example.com",
        password: testPassword,
        name: "테스트 사용자 2",
        phone: "010-9876-5432",
        school: "테스트 중학교",
        role: "user",
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log(`✅ 테스트 계정 2 생성: ${testUser2.name} (${testUser2.email})`);

    // 4. 최종 상태 확인
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log("\n📊 최종 사용자 목록:");
    allUsers.forEach((user, index) => {
      const roleBadge = user.role === "admin" ? "👑" : "👤";
      console.log(`   ${index + 1}. ${roleBadge} ${user.name} (${user.email || "이메일 없음"}) - ${user.role}`);
    });

    console.log("\n💡 테스트 계정 로그인 정보:");
    console.log("   계정 1:");
    console.log("     - 사용자명: testuser1");
    console.log("     - 이메일: test1@example.com");
    console.log("     - 비밀번호: test1234");
    console.log("   계정 2:");
    console.log("     - 사용자명: testuser2");
    console.log("     - 이메일: test2@example.com");
    console.log("     - 비밀번호: test1234");

    console.log("\n✨ 사용자 계정 정리 완료!");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
resetUsers()
  .then(() => {
    console.log("\n✅ 스크립트 실행 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 스크립트 실행 실패:", error);
    process.exit(1);
  });

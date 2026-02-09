import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// DATABASE_POOLING_URL이 있으면 사용, 없으면 DATABASE_URL 사용
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

async function main() {
  console.log("🧹 기존 사용자 정리 중...");

  // admin 계정을 제외한 모든 사용자 삭제
  const deleteResult = await prisma.user.deleteMany({
    where: {
      NOT: {
        username: "admin",
      },
    },
  });

  console.log(`✅ ${deleteResult.count}명의 사용자 삭제 완료 (admin 제외)`);

  // 테스트 계정 생성
  console.log("\n👤 테스트 계정 생성 중...");

  const testUser = {
    username: "test",
    email: "test@test.com",
    password: "test123",
    name: "테스트",
    phone: "010-1234-5678",
    school: "테스트 학교",
    role: "user" as const,
  };

  // 기존 테스트 계정 확인
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: testUser.username },
        { email: testUser.email },
      ],
    },
  });

  if (existingUser) {
    console.log(`⚠️  테스트 계정(${testUser.username})이 이미 존재합니다.`);
  } else {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // 테스트 계정 생성
    await prisma.user.create({
      data: {
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        phone: testUser.phone,
        school: testUser.school,
        role: testUser.role,
        emailVerified: true,
      },
    });

    console.log(`✅ 테스트 계정 생성 완료!`);
  }

  console.log("\n📋 현재 계정 정보:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const allUsers = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
      name: true,
      role: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  allUsers.forEach((user) => {
    console.log(`아이디: ${user.username}`);
    console.log(`이메일: ${user.email}`);
    console.log(`이름: ${user.name}`);
    console.log(`역할: ${user.role}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });

  console.log("\n🔑 테스트 계정 로그인 정보:");
  console.log(`아이디: ${testUser.username}`);
  console.log(`비밀번호: ${testUser.password}`);
}

main()
  .catch((e) => {
    console.error("❌ 오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

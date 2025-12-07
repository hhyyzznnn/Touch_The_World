import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 사용자 시드 데이터 생성 중...");

  // 샘플 사용자 계정들
  const users = [
    {
      email: "test@example.com",
      password: "test123",
      name: "테스트 사용자",
      phone: "010-1234-5678",
      school: "테스트 고등학교",
      role: "user",
    },
    {
      email: "admin@example.com",
      password: "admin123",
      name: "관리자",
      phone: "010-9876-5432",
      school: null,
      role: "admin",
    },
    {
      email: "user@example.com",
      password: "user123",
      name: "일반 사용자",
      phone: "010-5555-5555",
      school: "서울고등학교",
      role: "user",
    },
  ];

  for (const userData of users) {
    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️  ${userData.email} 이미 존재함, 건너뜀`);
      continue;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 사용자 생성
    await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone || null,
        school: userData.school || null,
        role: userData.role,
      },
    });

    console.log(`✅ ${userData.email} 생성 완료`);
  }

  console.log("\n📋 샘플 계정 정보:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  users.forEach((user) => {
    console.log(`이메일: ${user.email}`);
    console.log(`비밀번호: ${user.password}`);
    console.log(`이름: ${user.name}`);
    console.log(`역할: ${user.role}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });
}

main()
  .catch((e) => {
    console.error("❌ 에러 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


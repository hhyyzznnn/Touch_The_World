/**
 * 테스트 계정 1개 생성
 * - 아이디: test
 * - 비밀번호: test1234
 * - 이메일 인증 완료 상태로 생성되어 바로 로그인 가능
 *
 * 실행: npx ts-node scripts/create-test-account.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_USER = {
  username: "test",
  email: "test@test.com",
  password: "test1234",
  name: "테스트",
  phone: "010-0000-0000",
  school: "테스트 학교",
  role: "user" as const,
};

async function main() {
  const existing = await prisma.user.findUnique({
    where: { username: TEST_USER.username },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { emailVerified: true },
    });
    console.log("✅ 기존 계정이 있습니다. 이메일 인증 상태를 true로 갱신했습니다.");
  } else {
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    await prisma.user.create({
      data: {
        username: TEST_USER.username,
        email: TEST_USER.email,
        password: hashedPassword,
        name: TEST_USER.name,
        phone: TEST_USER.phone,
        school: TEST_USER.school,
        role: TEST_USER.role,
        emailVerified: true,
      },
    });
    console.log("✅ 테스트 계정을 생성했습니다.");
  }

  console.log("\n📋 로그인 정보 (/login):");
  console.log("   아이디:", TEST_USER.username);
  console.log("   비밀번호:", TEST_USER.password);
}

main()
  .catch((e) => {
    console.error("❌ 에러:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

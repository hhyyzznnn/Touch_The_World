import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = "syh2123";
  const password = "pyh030603$$";
  const name = "서양희";
  const role = "admin";

  // 이미 존재하는지 확인
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    console.log(`⚠️  '${username}' 계정이 이미 존재합니다.`);
    console.log(`   역할: ${existing.role}, 이름: ${existing.name}`);
    return;
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 관리자 계정 생성
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
      role,
      emailVerified: true,
    },
  });

  console.log(`✅ 관리자 계정 생성 완료`);
  console.log(`   아이디: ${user.username}`);
  console.log(`   이름:   ${user.name}`);
  console.log(`   역할:   ${user.role}`);
  console.log(`   ID:     ${user.id}`);
}

main()
  .catch((e) => {
    console.error("❌ 에러 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

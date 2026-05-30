import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "yejun4831@gmail.com";
  const username = "yejun4831";
  const password = "jr2564831!";
  const name = "예준";
  const role = "admin";

  // 이미 존재하는지 확인
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    console.log(`⚠️  이미 존재하는 계정입니다.`);
    console.log(`   아이디: ${existing.username}, 이메일: ${existing.email}, 역할: ${existing.role}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
      role,
      emailVerified: true,
    },
  });

  console.log(`✅ 관리자 계정 생성 완료`);
  console.log(`   아이디: ${user.username}`);
  console.log(`   이메일: ${user.email}`);
  console.log(`   이름:   ${user.name}`);
  console.log(`   역할:   ${user.role}`);
}

main()
  .catch((e) => {
    console.error("❌ 에러 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

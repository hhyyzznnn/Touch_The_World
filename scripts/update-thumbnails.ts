import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateThumbnails() {
  try {
    // 모든 프로그램의 썸네일을 program_01.png로 업데이트
    const result = await prisma.program.updateMany({
      data: {
        thumbnailUrl: "/images/programs/program_01.png",
      },
    });

    console.log(`✅ ${result.count}개 프로그램의 썸네일이 업데이트되었습니다.`);
  } catch (error) {
    console.error("❌ 썸네일 업데이트 중 오류:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateThumbnails();


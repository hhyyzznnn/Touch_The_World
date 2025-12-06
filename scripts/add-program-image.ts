import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("프로그램 이미지 추가 시작...");

  // 일본어 단기연수 집중 프로그램 찾기
  const program = await prisma.program.findFirst({
    where: {
      title: "일본어 단기연수 집중 프로그램",
    },
  });

  if (!program) {
    console.error("프로그램을 찾을 수 없습니다.");
    return;
  }

  console.log(`프로그램 찾음: ${program.title} (ID: ${program.id})`);

  // 기존 이미지 확인
  const existingImages = await prisma.programImage.findMany({
    where: { programId: program.id },
  });

  console.log(`기존 이미지 개수: ${existingImages.length}`);

  // program_01.png 이미지 추가 (중복 체크)
  const imageUrl = "/images/programs/program_01.png";
  const existingImage = await prisma.programImage.findFirst({
    where: {
      programId: program.id,
      url: imageUrl,
    },
  });

  if (existingImage) {
    console.log("이미지가 이미 존재합니다.");
  } else {
    // 썸네일이 없으면 썸네일로도 설정
    if (!program.thumbnailUrl) {
      await prisma.program.update({
        where: { id: program.id },
        data: {
          thumbnailUrl: imageUrl,
        },
      });
      console.log("썸네일 이미지로 설정 완료");
    }

    // 이미지 추가
    await prisma.programImage.create({
      data: {
        programId: program.id,
        url: imageUrl,
      },
    });
    console.log(`✅ 이미지 추가 완료: ${imageUrl}`);
  }

  console.log("프로그램 이미지 추가 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


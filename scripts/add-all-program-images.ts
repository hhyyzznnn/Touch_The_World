import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 프로그램별 이미지 URL 매핑 (Unsplash placeholder 이미지 사용)
const programImages: Record<string, { thumbnail: string; images: string[] }> = {
  "명품 독서캠프": {
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop",
    ],
  },
  "IMS 글로벌 영어캠프": {
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop",
    ],
  },
  "2018 기적의 공부법 CAMP": {
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop",
    ],
  },
  "HELP Junior 필리핀 영어캠프": {
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop",
    ],
  },
  "일본어 단기연수 집중 프로그램": {
    thumbnail: "/images/programs/program_01.png", // 이미 추가된 로컬 이미지
    images: [
      "/images/programs/program_01.png",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1920&h=1080&fit=crop",
    ],
  },
  "방송·입문 체험교실 — MBC World": {
    thumbnail: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop",
    ],
  },
  "런닝맨 체험 + 그레뱅 뮤지엄 패키지": {
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop",
    ],
  },
  "노트르담 드 파리 공연 관람": {
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&h=1080&fit=crop",
    ],
  },
  "배드민턴 월드투어 (Japan)": {
    thumbnail: "https://images.unsplash.com/photo-1622163642999-958ccb009558?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1622163642999-958ccb009558?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop",
    ],
  },
  "제주 인문학 SUMMER CAMP": {
    thumbnail: "https://images.unsplash.com/photo-1609840114031-3cf981032e6d?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1609840114031-3cf981032e6d?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop",
    ],
  },
  "리더십 인성 캠프 프로그램": {
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop",
    ],
  },
  "학생 간부 트레이닝 프로그램": {
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop",
    ],
  },
};

async function main() {
  console.log("모든 프로그램에 이미지 추가 시작...");

  let successCount = 0;
  let skipCount = 0;

  for (const [programTitle, imageData] of Object.entries(programImages)) {
    try {
      // 프로그램 찾기
      const program = await prisma.program.findFirst({
        where: { title: programTitle },
        include: { images: true },
      });

      if (!program) {
        console.log(`⚠️  프로그램을 찾을 수 없음: ${programTitle}`);
        continue;
      }

      // 썸네일이 없으면 설정
      if (!program.thumbnailUrl && imageData.thumbnail) {
        await prisma.program.update({
          where: { id: program.id },
          data: {
            thumbnailUrl: imageData.thumbnail,
          },
        });
        console.log(`✅ 썸네일 추가: ${programTitle}`);
      }

      // 기존 이미지 확인
      const existingImageUrls = new Set(program.images.map((img) => img.url));

      // 새 이미지 추가 (중복 제외)
      let addedCount = 0;
      for (const imageUrl of imageData.images) {
        if (!existingImageUrls.has(imageUrl)) {
          await prisma.programImage.create({
            data: {
              programId: program.id,
              url: imageUrl,
            },
          });
          addedCount++;
        }
      }

      if (addedCount > 0) {
        console.log(`✅ ${programTitle}: ${addedCount}개 이미지 추가`);
        successCount++;
      } else {
        console.log(`⏭️  ${programTitle}: 이미지가 이미 존재함`);
        skipCount++;
      }
    } catch (error) {
      console.error(`❌ ${programTitle} 이미지 추가 실패:`, error);
    }
  }

  console.log("\n=== 완료 ===");
  console.log(`✅ 성공: ${successCount}개 프로그램`);
  console.log(`⏭️  건너뜀: ${skipCount}개 프로그램`);
  console.log("모든 프로그램 이미지 추가 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


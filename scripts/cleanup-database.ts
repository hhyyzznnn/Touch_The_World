/**
 * 데이터베이스 정리 스크립트
 * 
 * 이 스크립트는 다음을 수행합니다:
 * 1. 모든 프로그램 삭제 (관련 이미지, 스케줄, 이벤트, 즐겨찾기 자동 삭제)
 * 2. 불필요한 데이터 삭제 (이벤트, 문의 내역, 상담 로그, 공고 등)
 * 
 * 주의: 이 스크립트는 데이터를 영구적으로 삭제합니다. 실행 전 백업을 권장합니다.
 */

import { PrismaClient } from "@prisma/client";

// DATABASE_POOLING_URL 환경 변수 사용 (다른 스크립트와 동일)
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

async function cleanupDatabase() {
  console.log("🧹 데이터베이스 정리 시작...\n");

  try {
    // 1. 프로그램 관련 데이터 삭제
    // Program을 삭제하면 onDelete: Cascade로 인해 다음이 자동 삭제됨:
    // - ProgramImage
    // - ProgramSchedule
    // - Event (프로그램과 연결된)
    // - Favorite
    
    const programCount = await prisma.program.count();
    console.log(`📦 프로그램 삭제 중... (${programCount}개)`);
    await prisma.program.deleteMany({});
    console.log("✅ 모든 프로그램 삭제 완료\n");

    // 2. 프로그램과 연결되지 않은 이벤트 삭제 (혹시 모를 경우)
    const eventCount = await prisma.event.count();
    console.log(`📅 이벤트 삭제 중... (${eventCount}개)`);
    await prisma.event.deleteMany({});
    console.log("✅ 모든 이벤트 삭제 완료\n");

    // EventImage는 Event 삭제 시 자동 삭제됨

    // 3. 문의 내역 삭제
    const inquiryCount = await prisma.inquiry.count();
    console.log(`📧 문의 내역 삭제 중... (${inquiryCount}개)`);
    await prisma.inquiry.deleteMany({});
    console.log("✅ 모든 문의 내역 삭제 완료\n");

    // 4. 상담 로그 삭제
    const consultingLogCount = await prisma.consultingLog.count();
    console.log(`💬 상담 로그 삭제 중... (${consultingLogCount}개)`);
    await prisma.consultingLog.deleteMany({});
    console.log("✅ 모든 상담 로그 삭제 완료\n");

    // 5. 나라장터 공고 삭제
    const g2bNoticeCount = await prisma.g2BNotice.count();
    console.log(`📢 나라장터 공고 삭제 중... (${g2bNoticeCount}개)`);
    await prisma.g2BNotice.deleteMany({});
    console.log("✅ 모든 나라장터 공고 삭제 완료\n");

    // NotificationLog는 G2BNotice 삭제 시 자동 삭제됨

    // 6. 만료된 인증 코드 삭제
    const expiredPhoneVerifications = await prisma.phoneVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log(`📱 만료된 전화번호 인증 코드 삭제: ${expiredPhoneVerifications.count}개`);

    const expiredEmailVerifications = await prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log(`📧 만료된 이메일 인증 코드 삭제: ${expiredEmailVerifications.count}개\n`);

    // 7. 통계 출력
    console.log("📊 정리 후 데이터베이스 상태:");
    console.log(`   - 프로그램: ${await prisma.program.count()}개`);
    console.log(`   - 이벤트: ${await prisma.event.count()}개`);
    console.log(`   - 문의 내역: ${await prisma.inquiry.count()}개`);
    console.log(`   - 상담 로그: ${await prisma.consultingLog.count()}개`);
    console.log(`   - 나라장터 공고: ${await prisma.g2BNotice.count()}개`);
    console.log(`   - 사용자: ${await prisma.user.count()}개`);
    console.log(`   - 학교: ${await prisma.school.count()}개`);
    console.log(`   - 고객: ${await prisma.client.count()}개`);
    console.log(`   - 상품: ${await prisma.product.count()}개`);
    console.log(`   - 문서: ${await prisma.document.count()}개`);
    console.log(`   - 성과: ${await prisma.achievement.count()}개\n`);

    console.log("✨ 데이터베이스 정리 완료!");
    console.log("\n💡 이제 관리자 페이지에서 새로운 프로그램을 등록할 수 있습니다.");

  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
cleanupDatabase()
  .then(() => {
    console.log("\n✅ 스크립트 실행 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 스크립트 실행 실패:", error);
    process.exit(1);
  });

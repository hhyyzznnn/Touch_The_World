/**
 * 캘린더 스키마 정리 백필 스크립트
 * 실행 순서: prisma/migrations/add_calendar_columns.sql 실행 →
 *           이 스크립트 실행 (npx tsx scripts/migrate-calendar-schema.ts) →
 *           결과(성공/실패 건수) 확인 → prisma/migrations/finalize_calendar_columns.sql 실행
 *
 * Event.notes에 박혀있던 "기간: YYYY-MM-DD ~ YYYY-MM-DD" 텍스트를 실제 endDate 컬럼으로 옮기고,
 * Inquiry.departureDate/returnDate 자유 텍스트를 최선 노력으로 파싱해
 * departureDateParsed/returnDateParsed 임시 컬럼에 옮긴다.
 *
 * 이 시점의 실제 DB는 스키마 변경이 진행 중인 과도기 상태(구 텍스트 컬럼 + 신규 임시 컬럼 공존)라
 * 타입이 고정된 Prisma Client 모델 API 대신 $queryRaw/$executeRaw로 직접 접근한다.
 */
import { config } from "dotenv";
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";

// db.*.supabase.co:5432 직접 연결은 IPv6 전용이라 일반 네트워크에서 막히는 경우가 많다.
// 커넥션 풀러(6543, pgbouncer)를 우선 사용하고, 없으면 기본 DATABASE_URL로 폴백한다.
const connectionUrl = process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl } },
});

const EVENT_RANGE_PATTERN = /기간:\s*(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/;
const EVENT_RANGE_STRIP_PATTERN = /\n?기간:\s*\d{4}-\d{2}-\d{2}\s*~\s*\d{4}-\d{2}-\d{2}.*$/;

function parseKoreanDate(text: string): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // YYYY-MM-DD / YYYY.MM.DD / YYYY/MM/DD
  let m = trimmed.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
  if (m) {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return isNaN(d.getTime()) ? null : d;
  }

  // YYYY년 M월 D일
  m = trimmed.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (m) {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

async function migrateEvents() {
  const events = await prisma.$queryRaw<Array<{ id: string; notes: string | null }>>`
    SELECT id, notes FROM "Event" WHERE notes LIKE '%기간:%'
  `;

  let updated = 0;
  for (const event of events) {
    if (!event.notes) continue;
    const match = event.notes.match(EVENT_RANGE_PATTERN);
    if (!match) continue;

    const endDate = new Date(`${match[2]}T00:00:00.000Z`);
    const cleanedNotes = event.notes.replace(EVENT_RANGE_STRIP_PATTERN, "").trim() || null;

    await prisma.$executeRaw`
      UPDATE "Event" SET "endDate" = ${endDate}, "notes" = ${cleanedNotes} WHERE id = ${event.id}
    `;
    updated++;
  }
  console.log(`[Event] 기간 텍스트 → endDate 이관: ${updated}건 / 대상 ${events.length}건`);
}

async function migrateInquiries() {
  const inquiries = await prisma.$queryRaw<
    Array<{ id: string; departureDate: string | null; returnDate: string | null }>
  >`SELECT id, "departureDate", "returnDate" FROM "Inquiry" WHERE "departureDate" IS NOT NULL OR "returnDate" IS NOT NULL`;

  let success = 0;
  const failed: Array<{ id: string; departureDate: string | null; returnDate: string | null }> = [];

  for (const inq of inquiries) {
    const parsedDeparture = inq.departureDate ? parseKoreanDate(inq.departureDate) : null;
    const parsedReturn = inq.returnDate ? parseKoreanDate(inq.returnDate) : null;

    if ((inq.departureDate && !parsedDeparture) || (inq.returnDate && !parsedReturn)) {
      failed.push(inq);
    }

    if (parsedDeparture || parsedReturn) {
      await prisma.$executeRaw`
        UPDATE "Inquiry"
        SET "departureDateParsed" = ${parsedDeparture}, "returnDateParsed" = ${parsedReturn}
        WHERE id = ${inq.id}
      `;
      success++;
    }
  }

  console.log(`[Inquiry] 날짜 파싱 성공: ${success}건 / 대상 ${inquiries.length}건`);
  if (failed.length > 0) {
    console.log(`[Inquiry] 파싱 실패 ${failed.length}건 (finalize 실행 전 수동 확인 필요):`);
    failed.forEach((f) =>
      console.log(`  - id=${f.id} departureDate="${f.departureDate}" returnDate="${f.returnDate}"`)
    );
  }
}

async function main() {
  await migrateEvents();
  await migrateInquiries();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

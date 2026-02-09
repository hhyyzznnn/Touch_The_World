#!/usr/bin/env tsx
/**
 * 로컬 테스트: 지정 이메일로 어제~오늘(또는 최근 기간) 나라장터 공고 알림 발송
 * 사용: BID_NOTICE_RECIPIENT_EMAIL=yejun4831@gmail.com npx tsx scripts/send-test-g2b-email.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fetchG2BNotices, parseG2BNotice } from "../lib/g2b-api";
import { sendDailyNotificationEmail } from "../lib/g2b-notification";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !match[1].startsWith("#")) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const RECIPIENT = process.env.BID_NOTICE_RECIPIENT_EMAIL || "yejun4831@gmail.com";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}${m}${d}${h}${min}`;
}

async function main() {
  console.log("🚀 나라장터 테스트 메일 발송\n");
  console.log(`   수신: ${RECIPIENT}\n`);

  // 최근 3일: 3일 전 0시 ~ 오늘 23시 59분
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 3);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const dateRange = { start: formatDate(start), end: formatDate(end) };
  const keywords = ["교육여행", "수학여행", "체험학습", "현장체험", "교육", "체험"];
  let allNotices: any[] = [];

  for (const keyword of keywords) {
    const list = await fetchG2BNotices("Servc", {
      pageNo: 1,
      numOfRows: 30,
      inqryDiv: 1,
      inqryBgnDt: dateRange.start,
      inqryEndDt: dateRange.end,
      bidNtceNm: keyword,
      useSearchApi: true,
    });
    allNotices = [...allNotices, ...list];
  }

  const unique = Array.from(new Map(allNotices.map((n) => [n.bidNtceNo, n])).values());
  const noticesToSend = unique.slice(0, 10).map((item) => {
    const p = parseG2BNotice(item);
    return {
      ...p,
      matchedKeywords: ["교육", "체험"].filter((k) =>
        p.title.toLowerCase().includes(k.toLowerCase())
      ),
    };
  });

  if (noticesToSend.length === 0) {
    console.log("⚠️  해당 기간 교육·체험 관련 공고가 없어, 용역 공고 3건으로 테스트 발송합니다.\n");
    const fallback = await fetchG2BNotices("Servc", {
      pageNo: 1,
      numOfRows: 5,
      inqryDiv: 1,
      inqryBgnDt: dateRange.start,
      inqryEndDt: dateRange.end,
    });
    fallback.slice(0, 3).forEach((item) => {
      const p = parseG2BNotice(item);
      noticesToSend.push({ ...p, matchedKeywords: [] });
    });
  }

  if (noticesToSend.length === 0) {
    console.log("❌ 발송할 공고가 없습니다. 날짜 범위나 API 키를 확인하세요.");
    process.exit(1);
  }

  console.log(`   발송할 공고: ${noticesToSend.length}건\n`);
  await sendDailyNotificationEmail(RECIPIENT, noticesToSend, dateRange);
  console.log(`\n✅ ${RECIPIENT} 로 테스트 메일 발송 요청 완료. 수신함을 확인하세요.`);
}

main().catch((e) => {
  console.error("❌ 실패:", e.message);
  process.exit(1);
});

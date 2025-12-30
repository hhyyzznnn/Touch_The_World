#!/usr/bin/env tsx
/**
 * 일일 알림 테스트: 어제 공고는 이미 발송했다고 가정하고 오늘 새 공고만 발송
 */

import * as fs from "fs";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { fetchG2BNotices, parseG2BNotice } from "../lib/g2b-api";
import { sendNotificationEmail } from "../lib/g2b-notification";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// .env 파일에서 환경 변수 로드
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !match[1].startsWith("#")) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function testDailyNotification() {
  try {
    console.log("📅 일일 알림 테스트 시작\n");
    console.log("가정: 어제(2025-12-29) 공고는 이미 발송 완료\n");

    // 1. 어제 공고를 DB에 저장 (이미 발송했다고 가정)
    console.log("1️⃣ 어제 공고를 DB에 저장 중...");
    const yesterday = new Date("2025-12-29");
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}${month}${day}${hour}${minute}`;
    };

    // 어제 공고 조회
    const yesterdayNotices = await fetchG2BNotices("Servc", {
      pageNo: 1,
      numOfRows: 10,
      inqryDiv: 1,
      inqryBgnDt: formatDate(yesterdayStart),
      inqryEndDt: formatDate(yesterdayEnd),
      bidNtceNm: "교육여행",
      useSearchApi: true,
    });

    // 어제 공고를 DB에 저장 (이미 발송 완료 상태)
    let savedYesterdayCount = 0;
    for (const noticeItem of yesterdayNotices.slice(0, 3)) {
      const parsed = parseG2BNotice(noticeItem);
      try {
        await prisma.g2BNotice.upsert({
          where: { noticeId: parsed.noticeId },
          update: {},
          create: {
            noticeId: parsed.noticeId,
            title: parsed.title,
            agency: parsed.agency,
            region: parsed.region,
            category: parsed.category,
            budget: parsed.budget,
            deadline: parsed.deadline,
            url: parsed.url,
            status: "notified", // 이미 발송 완료
          },
        });
        savedYesterdayCount++;
      } catch (e) {
        // 이미 존재하는 경우 무시
      }
    }
    console.log(`   어제 공고 ${savedYesterdayCount}개 저장 완료 (이미 발송 완료 상태)\n`);

    // 2. 오늘(2025-12-30) 새 공고 조회
    console.log("2️⃣ 오늘(2025-12-30) 새 공고 조회 중...");
    const today = new Date("2025-12-30");
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const keywords = ["교육여행", "수학여행", "체험학습", "현장체험"];
    let allTodayNotices: any[] = [];

    for (const keyword of keywords) {
      const notices = await fetchG2BNotices("Servc", {
        pageNo: 1,
        numOfRows: 20,
        inqryDiv: 1,
        inqryBgnDt: formatDate(todayStart),
        inqryEndDt: formatDate(todayEnd),
        bidNtceNm: keyword,
        useSearchApi: true,
      });
      allTodayNotices = [...allTodayNotices, ...notices];
    }

    // 중복 제거
    const uniqueTodayNotices = Array.from(
      new Map(allTodayNotices.map((n) => [n.bidNtceNo, n])).values()
    );

    console.log(`   조회된 공고: ${uniqueTodayNotices.length}개\n`);

    // 3. 이미 저장된 공고 제외 (새 공고만)
    console.log("3️⃣ 새 공고만 필터링 중...");
    const newNotices: any[] = [];
    for (const noticeItem of uniqueTodayNotices) {
      const parsed = parseG2BNotice(noticeItem);
      const existing = await prisma.g2BNotice.findUnique({
        where: { noticeId: parsed.noticeId },
      });
      if (!existing) {
        newNotices.push(noticeItem);
      }
    }

    console.log(`   새 공고: ${newNotices.length}개\n`);

    if (newNotices.length === 0) {
      console.log("✅ 새 공고가 없습니다. 이메일 발송 없음.");
      return;
    }

    // 4. 새 공고 이메일 발송
    console.log("4️⃣ 새 공고 이메일 발송 중...\n");
    const recipientEmail = process.env.BID_NOTICE_RECIPIENT_EMAIL || "yejun4831@gmail.com";

    for (let i = 0; i < Math.min(newNotices.length, 3); i++) {
      const noticeItem = newNotices[i];
      const parsed = parseG2BNotice(noticeItem);

      // 공고명에서 키워드 추출
      const titleLower = parsed.title.toLowerCase();
      const matchedKeywords: string[] = [];
      if (titleLower.includes("교육여행")) matchedKeywords.push("교육여행");
      if (titleLower.includes("수학여행")) matchedKeywords.push("수학여행");
      if (titleLower.includes("체험학습")) matchedKeywords.push("체험학습");
      if (titleLower.includes("현장체험")) matchedKeywords.push("현장체험");

      try {
        await sendNotificationEmail(recipientEmail, {
          ...parsed,
          matchedKeywords: matchedKeywords,
        });

        // DB에 저장
        await prisma.g2BNotice.create({
          data: {
            noticeId: parsed.noticeId,
            title: parsed.title,
            agency: parsed.agency,
            region: parsed.region,
            category: parsed.category,
            budget: parsed.budget,
            deadline: parsed.deadline,
            url: parsed.url,
            status: "notified",
            matchedKeywords: matchedKeywords,
          },
        });

        console.log(`✅ ${i + 1}. ${parsed.title.substring(0, 50)}...`);
      } catch (error: any) {
        console.error(`❌ ${i + 1}번째 공고 발송 실패:`, error.message);
      }
    }

    console.log(`\n✅ 총 ${Math.min(newNotices.length, 3)}개 새 공고 발송 완료`);
    console.log(`받는 사람: ${recipientEmail}`);

  } catch (error: any) {
    console.error("❌ 오류 발생:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDailyNotification();


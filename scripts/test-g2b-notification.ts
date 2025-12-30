#!/usr/bin/env tsx
/**
 * 나라장터 알림 테스트 스크립트
 */

import * as fs from "fs";
import * as path from "path";
import { processG2BNotifications } from "../lib/g2b-notification";
import { fetchG2BNotices } from "../lib/g2b-api";

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

async function test() {
  try {
    console.log("🚀 나라장터 알림 테스트 시작...\n");
    
    // 1. API 호출 테스트 (날짜 범위 포함)
    console.log("1️⃣ API 호출 테스트...");
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}${month}${day}${hour}${minute}`;
    };
    
    const notices = await fetchG2BNotices("Servc", {
      pageNo: 1,
      numOfRows: 5,
      inqryDiv: 1,
      inqryBgnDt: formatDate(yesterday),
      inqryEndDt: formatDate(today),
    });
    console.log(`   조회된 공고 수: ${notices.length}개`);
    if (notices.length > 0) {
      console.log(`   첫 번째 공고: ${notices[0].bidNtceNm}`);
    }
    console.log();
    
    // 2. 알림 처리 테스트
    console.log("2️⃣ 알림 처리 테스트...");
    const result = await processG2BNotifications();
    
    console.log("\n✅ 테스트 완료:");
    console.log(`   - 처리된 공고: ${result.processed}개`);
    console.log(`   - 발송된 알림: ${result.sent}개`);
    
  } catch (error: any) {
    console.error("\n❌ 테스트 실패:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

test();


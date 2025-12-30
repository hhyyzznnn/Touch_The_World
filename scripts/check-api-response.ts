#!/usr/bin/env tsx
/**
 * API 응답 구조 확인
 */

import * as fs from "fs";
import * as path from "path";
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

async function checkResponse() {
  try {
    const notices = await fetchG2BNotices("Servc", {
      pageNo: 1,
      numOfRows: 1,
      inqryDiv: 1,
      inqryBgnDt: "202512010000",
      inqryEndDt: "202512302359",
    });
    
    if (notices.length > 0) {
      console.log("=== API 응답 필드 목록 ===\n");
      const notice = notices[0];
      Object.keys(notice).forEach((key) => {
        const value = notice[key as keyof typeof notice];
        console.log(`${key}: ${JSON.stringify(value)}`);
      });
      
      console.log("\n=== 현재 파싱 함수에서 사용하는 필드 ===\n");
      console.log("bidNtceNo (noticeId):", notice.bidNtceNo);
      console.log("bidNtceNm (title):", notice.bidNtceNm);
      console.log("dminsttNm (agency):", notice.dminsttNm);
      console.log("ntceInsttNm (agency):", notice.ntceInsttNm);
      console.log("cnstrtsiteRgnNm (region):", notice.cnstrtsiteRgnNm);
      console.log("prtcptLmtRgnNm (region):", notice.prtcptLmtRgnNm);
      console.log("pubPrcrmntClsfcNm (category):", notice.pubPrcrmntClsfcNm);
      console.log("srvceDivNm (category):", notice.srvceDivNm);
      console.log("presmptPrce (budget):", notice.presmptPrce);
      console.log("bidClseDt (deadline):", notice.bidClseDt);
    } else {
      console.log("공고를 찾을 수 없습니다.");
    }
  } catch (error: any) {
    console.error("오류:", error.message);
  }
}

checkResponse();


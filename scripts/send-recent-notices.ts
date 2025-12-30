#!/usr/bin/env tsx
/**
 * 최근 나라장터 공고 3개를 이메일로 발송
 */

import * as fs from "fs";
import * as path from "path";
import { fetchG2BNotices, parseG2BNotice } from "../lib/g2b-api";
import { Resend } from "resend";

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

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const recipientEmail = process.env.BID_NOTICE_RECIPIENT_EMAIL || "yejun4831@gmail.com";

async function sendRecentNotices() {
  try {
    console.log("🔍 최근 나라장터 공고 조회 중...\n");

    // 화면과 동일한 날짜 범위: 2025/12/01 ~ 2025/12/30
    const startDate = new Date("2025-12-01T00:00:00");
    const endDate = new Date("2025-12-30T23:59:59");

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}${month}${day}${hour}${minute}`;
    };

    // 교육여행 키워드로 용역 공고 조회 (더 많은 페이지)
    console.log("교육여행 키워드로 검색 중...\n");
    let allNotices: any[] = [];
    
    // 여러 페이지 조회 (최대 5페이지)
    for (let page = 1; page <= 5 && allNotices.length < 3; page++) {
      // 검색 API 사용 (키워드 검색 지원) 또는 기본 API 사용
      const notices = await fetchG2BNotices("Servc", {
        pageNo: page,
        numOfRows: 50, // 페이지당 더 많이 조회 (최대 999)
        inqryDiv: 1,
        inqryBgnDt: formatDate(startDate),
        inqryEndDt: formatDate(endDate),
        bidNtceNm: "교육여행", // 검색 API 사용 시 부분 일치 검색 지원
        useSearchApi: true, // 검색 API 사용 (키워드 검색 지원)
      });
      
      if (notices.length === 0) break;
      
      // 클라이언트 측에서 "교육여행" 키워드 필터링
      const filtered = notices.filter((notice: any) => 
        notice.bidNtceNm?.includes("교육여행") || 
        notice.bidNtceNm?.includes("수학여행") ||
        notice.bidNtceNm?.includes("체험학습")
      );
      
      allNotices = [...allNotices, ...filtered];
      console.log(`페이지 ${page}: ${notices.length}개 조회 → ${filtered.length}개 필터링 (누적: ${allNotices.length}개)`);
      
      if (allNotices.length >= 3) break;
    }

    console.log(`조회된 공고 수: ${allNotices.length}개\n`);

    if (allNotices.length === 0) {
      console.log("❌ 최근 공고가 없습니다.");
      console.log("   다른 날짜 범위나 다른 오퍼레이션을 시도해보세요.");
      return;
    }

    // 최근 3개 선택
    const recentNotices = allNotices.slice(0, 3);
    console.log(`📧 최근 공고 3개를 이메일로 발송합니다...\n`);

    if (!resend) {
      console.log("⚠️  RESEND_API_KEY가 설정되지 않아 개발 모드로 실행됩니다.");
      recentNotices.forEach((item, index) => {
        const parsed = parseG2BNotice(item);
        console.log(`\n${index + 1}. ${parsed.title}`);
        console.log(`   발주기관: ${parsed.agency}`);
        console.log(`   URL: ${parsed.url}`);
      });
      return;
    }

    // 각 공고를 이메일로 발송
    for (let i = 0; i < recentNotices.length; i++) {
      const item = recentNotices[i];
      const parsed = parseG2BNotice(item);

      const budgetText = parsed.budget
        ? `${(Number(parsed.budget) / 100000000).toFixed(1)}억원`
        : "미정";

      const deadlineText = parsed.deadline
        ? parsed.deadline.toLocaleDateString("ko-KR")
        : "미정";

      try {
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "no-reply@touchtheworld.co.kr",
          to: recipientEmail,
          subject: `[나라장터 알림 ${i + 1}/3] ${parsed.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2E6D45;">새로운 입찰 공고가 등록되었습니다</h2>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${parsed.title}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #333; width: 120px;">발주기관:</td>
                    <td style="padding: 8px 0; color: #666;">${parsed.agency}</td>
                  </tr>
                  ${parsed.region ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">지역:</td>
                    <td style="padding: 8px 0; color: #666;">${parsed.region}</td>
                  </tr>
                  ` : ''}
                  ${parsed.category ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">분류:</td>
                    <td style="padding: 8px 0; color: #666;">${parsed.category}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">예산:</td>
                    <td style="padding: 8px 0; color: #666;">${budgetText}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">마감일:</td>
                    <td style="padding: 8px 0; color: #666;">${deadlineText}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">공고번호:</td>
                    <td style="padding: 8px 0; color: #666;">${parsed.noticeId}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${parsed.url}" 
                   style="background-color: #2E6D45; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  공고 상세 보기
                </a>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                이 이메일은 나라장터 알림 자동화 시스템에서 발송되었습니다.<br/>
                (${i + 1}/3)
              </p>
            </div>
          `,
        });

        if (error) {
          console.error(`❌ ${i + 1}번째 공고 발송 실패:`, error.message);
        } else {
          console.log(`✅ ${i + 1}. ${parsed.title.substring(0, 50)}...`);
          console.log(`   이메일 ID: ${data?.id || "N/A"}`);
        }

        // 이메일 발송 간격 (1초)
        if (i < recentNotices.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        console.error(`❌ ${i + 1}번째 공고 발송 오류:`, error.message);
      }
    }

    console.log(`\n✅ 총 ${recentNotices.length}개 공고 발송 완료`);
    console.log(`받는 사람: ${recipientEmail}`);

  } catch (error: any) {
    console.error("❌ 오류 발생:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

sendRecentNotices();


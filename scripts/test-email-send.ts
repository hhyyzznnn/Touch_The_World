#!/usr/bin/env tsx
/**
 * 이메일 발송 테스트 (더미 데이터)
 */

import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";

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

async function testEmail() {
  try {
    console.log("📧 테스트 이메일 발송 중...\n");
    console.log(`받는 사람: ${recipientEmail}\n`);

    if (!resend) {
      console.log("⚠️  RESEND_API_KEY가 설정되지 않아 개발 모드로 실행됩니다.");
      console.log("=".repeat(60));
      console.log("📧 나라장터 알림 이메일 (개발 모드)");
      console.log("=".repeat(60));
      console.log(`받는 사람: ${recipientEmail}`);
      console.log("제목: [나라장터 알림] 테스트 입찰 공고");
      console.log("=".repeat(60));
      return;
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "no-reply@touchtheworld.co.kr",
      to: recipientEmail,
      subject: "[나라장터 알림] 테스트 입찰 공고",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E6D45;">새로운 입찰 공고가 등록되었습니다</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">테스트 입찰 공고 - 교육여행 프로그램</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333; width: 120px;">발주기관:</td>
                <td style="padding: 8px 0; color: #666;">테스트 교육청</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">지역:</td>
                <td style="padding: 8px 0; color: #666;">경상남도</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">분류:</td>
                <td style="padding: 8px 0; color: #666;">교육</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">예산:</td>
                <td style="padding: 8px 0; color: #666;">5.0억원</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">마감일:</td>
                <td style="padding: 8px 0; color: #666;">2025-12-31</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">매칭 키워드:</td>
                <td style="padding: 8px 0; color: #666;">교육여행, 수학여행</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.g2b.go.kr" 
               style="background-color: #2E6D45; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              공고 상세 보기
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            이 이메일은 나라장터 알림 자동화 시스템 테스트입니다.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ 이메일 발송 실패:", error);
      process.exit(1);
    }

    console.log("✅ 이메일 발송 성공!");
    console.log(`   이메일 ID: ${data?.id || "N/A"}`);
    console.log(`   받는 사람: ${recipientEmail}`);
    
  } catch (error: any) {
    console.error("❌ 오류 발생:", error.message);
    process.exit(1);
  }
}

testEmail();


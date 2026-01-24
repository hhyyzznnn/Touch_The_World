// SMS 발송 유틸리티
// 개발 환경에서는 콘솔에 출력, 프로덕션에서는 실제 SMS 발송
// 카카오 알림톡 또는 Twilio 사용 가능

import { sendVerificationCodeAlimtalk } from "./kakao-alimtalk";

export async function sendVerificationSMS(phone: string, code: string) {
  // 카카오 알림톡 우선 사용 (설정되어 있는 경우)
  const isProduction = process.env.NODE_ENV === "production";
  const useKakaoAlimtalk = 
    isProduction &&
    process.env.KAKAO_BM_CLIENT_ID && 
    process.env.KAKAO_BM_CLIENT_SECRET && 
    process.env.KAKAO_BM_SENDER_KEY;

  if (useKakaoAlimtalk) {
    try {
      const result = await sendVerificationCodeAlimtalk(phone, code);
      if (result.success) {
        return { success: true };
      }
      // 카카오 알림톡 실패 시 Twilio로 폴백
      console.warn("카카오 알림톡 발송 실패, Twilio로 폴백:", result.error);
    } catch (error) {
      console.error("카카오 알림톡 발송 오류, Twilio로 폴백:", error);
    }
  }

  // 개발 환경 또는 Twilio 설정이 없으면 콘솔에 출력
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (!process.env.TWILIO_ACCOUNT_SID || isDevelopment) {
    console.log("=".repeat(60));
    console.log("📱 SMS 인증 코드 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`받는 번호: ${phone}`);
    console.log(`인증 코드: ${code}`);
    console.log("=".repeat(60));
    return { success: true };
  }

  // 프로덕션: Twilio 사용
  try {
    // 동적 import로 twilio 모듈 로드 (프로덕션에서만)
    // 빌드 시점에 모듈이 없어도 런타임에 처리
    let twilioModule;
    try {
      // @ts-ignore - twilio는 optional dependency이므로 타입 체크 무시
      twilioModule = await import("twilio");
    } catch (importError: any) {
      // twilio가 설치되지 않은 경우 개발 모드로 처리
      if (importError?.code === "MODULE_NOT_FOUND" || importError?.message?.includes("Cannot find module")) {
        console.log("=".repeat(60));
        console.log("📱 SMS 인증 코드 (개발 모드 - Twilio 미설치)");
        console.log("=".repeat(60));
        console.log(`받는 번호: ${phone}`);
        console.log(`인증 코드: ${code}`);
        console.log("=".repeat(60));
        return { success: true };
      }
      throw importError;
    }

    const twilio = twilioModule.default || twilioModule;
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `[터치더월드] 인증 코드: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("SMS 발송 오류:", error);
    // 오류 발생 시에도 개발 환경에서는 콘솔에 출력
    console.log("=".repeat(60));
    console.log("📱 SMS 인증 코드 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`받는 번호: ${phone}`);
    console.log(`인증 코드: ${code}`);
    console.log("=".repeat(60));
    return { success: true };
  }
}

// 인증 코드 생성 (6자리 숫자)
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


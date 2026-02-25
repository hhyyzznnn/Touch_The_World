// SMS 발송 유틸리티
// 개발 환경에서는 콘솔에 출력, 프로덕션에서는 카카오 알림톡 사용

import { sendVerificationCodeAlimtalk } from "./kakao-alimtalk";

export async function sendVerificationSMS(phone: string, code: string) {
  // 카카오 알림톡 사용 (설정되어 있는 경우)
  const isProduction = process.env.NODE_ENV === "production";
  const hasClientId = Boolean(process.env.KAKAO_BM_CLIENT_ID || process.env.BIZM_CLIENT_ID);
  const hasClientSecret = Boolean(process.env.KAKAO_BM_CLIENT_SECRET || process.env.BIZM_CLIENT_SECRET);
  const hasSenderKey = Boolean(process.env.KAKAO_BM_SENDER_KEY || process.env.BIZM_SENDER_KEY);
  const useKakaoAlimtalk = 
    isProduction &&
    hasClientId &&
    hasClientSecret &&
    hasSenderKey;

  if (useKakaoAlimtalk) {
    try {
      const result = await sendVerificationCodeAlimtalk(phone, code);
      if (result.success) {
        return { success: true };
      }
      console.warn("카카오 알림톡 발송 실패:", result.error);
    } catch (error) {
      console.error("카카오 알림톡 발송 오류:", error);
    }
  }

  // 개발 환경 또는 카카오 알림톡 설정이 없으면 콘솔에 출력
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (!useKakaoAlimtalk || isDevelopment) {
    console.log("=".repeat(60));
    console.log("📱 SMS 인증 코드 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`받는 번호: ${phone}`);
    console.log(`인증 코드: ${code}`);
    console.log("=".repeat(60));
    return { success: true };
  }

  return { success: false, error: "카카오 알림톡 설정이 필요합니다." };
}

// 인증 코드 생성 (6자리 숫자)
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

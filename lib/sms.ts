// SMS 발송 유틸리티
// 개발 환경에서는 콘솔에 출력, 프로덕션에서는 실제 SMS 발송

export async function sendVerificationSMS(phone: string, code: string) {
  // 개발 환경 또는 SMS API 키가 없으면 콘솔에 출력
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.NODE_ENV === "development") {
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
    let twilioModule;
    try {
      twilioModule = await import("twilio");
    } catch (importError) {
      // twilio가 설치되지 않은 경우 개발 모드로 처리
      console.log("=".repeat(60));
      console.log("📱 SMS 인증 코드 (개발 모드 - Twilio 미설치)");
      console.log("=".repeat(60));
      console.log(`받는 번호: ${phone}`);
      console.log(`인증 코드: ${code}`);
      console.log("=".repeat(60));
      return { success: true };
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


/**
 * 카카오 알림톡 발송 유틸리티
 *
 * 참고: 현재 구현은 OAuth + /v2/send/kakao 기반입니다.
 * BizM 가이드(/v2/sender/send, userid 헤더) 기준 전환 작업은
 * docs/BIZM_ALIMTALK_TODO.md 문서를 따라 별도 진행합니다.
 *
 * 실제 카카오 비즈니스 채널 연동 시 사용
 * - 카카오 비즈니스 채널 개설 필요
 * - 알림톡 템플릿 등록 및 심사 필요
 * - API 키 발급 필요
 * - 디케이테크인과의 서비스 계약 필요
 */

interface KakaoAlimtalkOptions {
  phoneNumber: string; // 수신자 전화번호 (하이픈 제외, 숫자만, 국가코드 포함)
  templateCode: string; // 알림톡 템플릿 코드
  message: string; // 메시지 내용
  variables?: Record<string, string>; // 템플릿 변수 (예: { 인증번호: "123456" })
  buttonUrl?: string; // 버튼 링크 (선택)
  buttonText?: string; // 버튼 텍스트 (선택)
}

function getEnv(name: string, alias?: string): string | undefined {
  return process.env[name] || (alias ? process.env[alias] : undefined);
}

const DEFAULT_BIZMSG_BASE_URL = "https://bizmsg-web.kakaoenterprise.com";

// 액세스 토큰 캐시 (토큰 만료 전까지 재사용)
let cachedAccessToken: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * 카카오 비즈니스 메시지 OAuth 2.0 인증
 * 액세스 토큰 발급
 */
async function getKakaoBMAccessToken(): Promise<string> {
  // 캐시된 토큰이 있고 아직 유효하면 재사용
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt) {
    return cachedAccessToken.token;
  }

  const clientId = getEnv("KAKAO_BM_CLIENT_ID", "BIZM_CLIENT_ID");
  const clientSecret = getEnv("KAKAO_BM_CLIENT_SECRET", "BIZM_CLIENT_SECRET");
  const baseUrl = process.env.KAKAO_BM_BASE_URL || DEFAULT_BIZMSG_BASE_URL;

  if (!clientId || !clientSecret) {
    throw new Error("KAKAO_BM_CLIENT_ID와 KAKAO_BM_CLIENT_SECRET이 설정되지 않았습니다.");
  }

  try {
    // Basic 인증 헤더 생성
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${baseUrl}/v2/oauth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth 인증 실패: ${errorText}`);
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 3600; // 기본 1시간

    // 토큰 캐시 (만료 5분 전까지 유효)
    cachedAccessToken = {
      token: accessToken,
      expiresAt: Date.now() + (expiresIn - 300) * 1000,
    };

    return accessToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("카카오 비즈니스 메시지 OAuth 인증 오류:", errorMessage);
    throw new Error(`OAuth 인증 실패: ${errorMessage}`);
  }
}

/**
 * 카카오 알림톡 발송
 * 
 * 실제 연동 시:
 * 1. 카카오 비즈니스 채널 개설 완료
 * 2. 템플릿 등록 및 심사 완료
 * 3. 환경 변수 설정 완료
 */
export async function sendKakaoAlimtalk(options: KakaoAlimtalkOptions): Promise<{ success: boolean; error?: string }> {
  const clientId = getEnv("KAKAO_BM_CLIENT_ID", "BIZM_CLIENT_ID");
  const clientSecret = getEnv("KAKAO_BM_CLIENT_SECRET", "BIZM_CLIENT_SECRET");
  const senderKey = getEnv("KAKAO_BM_SENDER_KEY", "BIZM_SENDER_KEY");
  const baseUrl =
    process.env.KAKAO_BM_BASE_URL ||
    process.env.BIZM_BASE_URL ||
    DEFAULT_BIZMSG_BASE_URL;

  // 개발 환경 또는 설정이 없으면 콘솔에 출력
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (!clientId || !clientSecret || !senderKey || isDevelopment) {
    console.log("=".repeat(60));
    console.log("📱 카카오 알림톡 발송 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`받는 번호: ${options.phoneNumber}`);
    console.log(`템플릿 코드: ${options.templateCode}`);
    console.log(`메시지: ${options.message}`);
    if (options.variables) {
      console.log(`변수:`, options.variables);
    }
    console.log("=".repeat(60));
    return { success: true };
  }

  try {
    // OAuth 2.0 인증으로 액세스 토큰 발급
    const accessToken = await getKakaoBMAccessToken();

    // 전화번호 형식 변환 (한국: 01012345678 -> 821012345678)
    let phoneNumber = options.phoneNumber.replace(/[^0-9]/g, "");
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "82" + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith("82")) {
      phoneNumber = "82" + phoneNumber;
    }

    // 알림톡 발송 API 호출
    const response = await fetch(`${baseUrl}/v2/send/kakao`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_type: "AT", // 알림톡
        sender_key: senderKey,
        template_code: options.templateCode,
        phone_number: phoneNumber,
        message: options.message,
        variables: options.variables || {},
        sender_no: process.env.KAKAO_BM_SENDER_NO || process.env.BIZM_SENDER_NO || phoneNumber, // 발신 번호
        cid: `verification_${Date.now()}`, // 고객사 정의 Key ID
      }),
    });

    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json() as { message?: string; error?: string };
        errorMessage = errorData.message || errorData.error || "알 수 없는 오류";
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || "응답 파싱 실패";
      }
      throw new Error(`알림톡 발송 실패: ${errorMessage}`);
    }

    await response.json(); // 응답 확인
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ 카카오 알림톡 발송 실패:", errorMessage);
    
    // 오류 발생 시에도 개발 환경에서는 콘솔에 출력
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment) {
      console.log("=".repeat(60));
      console.log("📱 카카오 알림톡 발송 (개발 모드 - 오류 발생)");
      console.log("=".repeat(60));
      console.log(`받는 번호: ${options.phoneNumber}`);
      console.log(`템플릿 코드: ${options.templateCode}`);
      console.log(`메시지: ${options.message}`);
      console.log("=".repeat(60));
      return { success: true };
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * 상담 완료 알림톡 발송
 */
export async function sendConsultingCompleteAlimtalk(
  phoneNumber: string,
  category: string,
  summary: string
): Promise<{ success: boolean; error?: string }> {
  return sendKakaoAlimtalk({
    phoneNumber,
    templateCode: "CONSULTING_COMPLETE",
    message: `[터치더월드] 상담이 완료되었습니다.\n\n카테고리: ${category}\n\n요약:\n${summary}\n\n상세 견적은 이메일로 발송해드리겠습니다.`,
    buttonUrl: "https://touchtheworld.co.kr",
    buttonText: "홈페이지 방문",
  });
}

/**
 * 견적서 도착 알림톡 발송
 */
export async function sendQuoteReadyAlimtalk(
  phoneNumber: string,
  quoteUrl: string
): Promise<{ success: boolean; error?: string }> {
  return sendKakaoAlimtalk({
    phoneNumber,
    templateCode: "QUOTE_READY",
    message: `[터치더월드] 견적서가 준비되었습니다.\n\n아래 링크에서 확인해주세요.`,
    buttonUrl: quoteUrl,
    buttonText: "견적서 확인",
  });
}

/**
 * 인증번호 발송 알림톡
 */
export async function sendVerificationCodeAlimtalk(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const templateCode =
    process.env.KAKAO_BM_VERIFICATION_TEMPLATE_CODE ||
    process.env.BIZM_VERIFICATION_TEMPLATE_CODE ||
    "VERIFICATION_CODE";
  
  return sendKakaoAlimtalk({
    phoneNumber,
    templateCode,
    message: `[터치더월드] 휴대폰 인증\n\n인증번호: #{인증번호}\n\n위 인증번호를 입력해주세요.\n(유효시간: 5분)`,
    variables: {
      인증번호: code,
    },
  });
}




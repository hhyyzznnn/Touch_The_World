/**
 * 카카오 알림톡 발송 유틸리티
 *
 * BizM Sender API (/v2/sender/send, userid 헤더) 기반 구현입니다.
 *
 * 실제 카카오 비즈니스 채널 연동 시 사용
 * - 카카오 비즈니스 채널 개설 필요
 * - 알림톡 템플릿 등록 및 심사 필요
 * - BizM 계정(userid) 및 발신프로필키 필요
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

const DEFAULT_BIZMSG_BASE_URL = "https://alimtalk-api.bizmsg.kr";
const DEFAULT_BIZMSG_SEND_PATH = "/v2/sender/send";

function resolveBizmUserId(): string | undefined {
  return (
    process.env.BIZM_USER_ID ||
    getEnv("KAKAO_BM_CLIENT_ID", "BIZM_CLIENT_ID")
  );
}

function resolveBizmUserKey(): string | undefined {
  return (
    process.env.BIZM_USER_KEY ||
    getEnv("KAKAO_BM_CLIENT_SECRET", "BIZM_CLIENT_SECRET")
  );
}

function normalizePhoneNumber(phoneNumberRaw: string): string {
  let phoneNumber = phoneNumberRaw.replace(/[^0-9]/g, "");
  if (phoneNumber.startsWith("0")) {
    phoneNumber = "82" + phoneNumber.substring(1);
  } else if (!phoneNumber.startsWith("82")) {
    phoneNumber = "82" + phoneNumber;
  }
  return phoneNumber;
}

function applyTemplateVariables(
  message: string,
  variables?: Record<string, string>
): string {
  if (!variables) return message;
  let replaced = message;
  for (const [key, value] of Object.entries(variables)) {
    replaced = replaced.replace(new RegExp(`#\\{${key}\\}`, "g"), value);
  }
  return replaced;
}

function resolveSendEndpoint(baseUrlRaw: string): string {
  const baseUrl = baseUrlRaw.trim().replace(/\/+$/, "");
  if (baseUrl.endsWith(DEFAULT_BIZMSG_SEND_PATH)) {
    return baseUrl;
  }
  return `${baseUrl}${DEFAULT_BIZMSG_SEND_PATH}`;
}

function formatBizmError(error: unknown, endpoint: string): string {
  if (!(error instanceof Error)) {
    return `알 수 없는 오류: ${String(error)} (endpoint=${endpoint})`;
  }

  const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
  const causeText = cause?.code || cause?.message;
  if (causeText) {
    return `${error.message} (cause=${causeText}, endpoint=${endpoint})`;
  }
  return `${error.message} (endpoint=${endpoint})`;
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
  const userId = resolveBizmUserId();
  const userKey = resolveBizmUserKey();
  const senderKey = getEnv("KAKAO_BM_SENDER_KEY", "BIZM_SENDER_KEY");
  const baseUrl =
    process.env.KAKAO_BM_BASE_URL ||
    process.env.BIZM_BASE_URL ||
    DEFAULT_BIZMSG_BASE_URL;
  const sendEndpoint =
    process.env.KAKAO_BM_SEND_ENDPOINT ||
    process.env.BIZM_SEND_ENDPOINT ||
    resolveSendEndpoint(baseUrl);

  // 개발 환경 또는 설정이 없으면 콘솔에 출력
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (!userId || !senderKey || isDevelopment) {
    console.log("=".repeat(60));
    console.log("📱 카카오 알림톡 발송 (개발 모드)");
    console.log("=".repeat(60));
    console.log(`사용자 계정(userid): ${userId || "미설정"}`);
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
    const phoneNumber = normalizePhoneNumber(options.phoneNumber);
    const finalMessage = applyTemplateVariables(options.message, options.variables);
    const payload: Record<string, unknown> = {
      message_type: "AT",
      phn: phoneNumber,
      profile: senderKey,
      tmplId: options.templateCode,
      msg: finalMessage,
      reserveDt: "00000000000000",
    };

    if (options.buttonText && options.buttonUrl) {
      payload.button1 = {
        name: options.buttonText,
        type: "WL",
        url_mobile: options.buttonUrl,
        url_pc: options.buttonUrl,
      };
    }

    const smsSender = process.env.KAKAO_BM_SENDER_NO || process.env.BIZM_SENDER_NO;
    if (smsSender) {
      payload.smsSender = smsSender;
      payload.smsKind = "S";
      payload.msgSms = finalMessage;
    }

    const headers: Record<string, string> = {
      userid: userId,
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
    };
    if (userKey) {
      headers.userkey = userKey;
    }

    const timeoutMs = Number(process.env.BIZM_FETCH_TIMEOUT_MS || 10000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(sendEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify([payload]),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const responseText = await response.text();
    let responseData: unknown = responseText;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // non-json fallback
    }

    if (!response.ok) {
      throw new Error(
        `BizM 요청 실패(status=${response.status}): ${responseText || "응답 본문 없음"}`
      );
    }

    // /v2/sender/send 응답은 배열 또는 객체 형태가 올 수 있어 방어적으로 처리
    const firstResult = Array.isArray(responseData)
      ? responseData[0]
      : responseData;
    const resultObj =
      firstResult && typeof firstResult === "object"
        ? (firstResult as Record<string, unknown>)
        : {};
    const resultCode = String(resultObj.code || "");
    const sendCode = String(resultObj.result || resultObj.result_code || "");
    const message = String(resultObj.message || "");

    const isSuccess =
      resultCode.toLowerCase() === "success" ||
      resultCode === "K000" ||
      sendCode === "K000";

    if (!isSuccess) {
      throw new Error(
        `BizM 발송 실패(code=${resultCode || sendCode || "unknown"}): ${message || JSON.stringify(responseData)}`
      );
    }

    return { success: true };
  } catch (error) {
    const errorMessage = formatBizmError(error, sendEndpoint);
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


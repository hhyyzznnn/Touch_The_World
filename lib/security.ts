/**
 * 보안 유틸리티 함수
 * XSS 방지, 입력 검증 등
 */

/**
 * 텍스트 입력 정리 (앞뒤 공백 제거, 연속 공백 제거)
 */
export function sanitizeText(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 전화번호 형식 검증 (한국)
 */
export function isValidPhone(phone: string): boolean {
  // 하이픈 제거 후 검증
  const cleaned = phone.replace(/[-\s]/g, "");
  // 010으로 시작하는 11자리 또는 010-XXXX-XXXX 형식
  const phoneRegex = /^010\d{8}$|^010-\d{4}-\d{4}$/;
  return phoneRegex.test(cleaned);
}

/**
 * XSS 패턴 검사
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror 등
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * 입력 검증 및 정리
 */
export function validateAndSanitize(
  input: string,
  options: {
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    required?: boolean;
  } = {}
): { valid: boolean; sanitized?: string; error?: string } {
  const {
    maxLength = 10000,
    minLength = 0,
    allowHtml = false,
    required = false,
  } = options;

  // 필수 검증
  if (required && !input) {
    return { valid: false, error: "필수 입력 항목입니다." };
  }

  if (!input) {
    return { valid: true, sanitized: "" };
  }

  // 길이 검증
  if (input.length > maxLength) {
    return {
      valid: false,
      error: `최대 ${maxLength}자까지 입력 가능합니다.`,
    };
  }

  if (input.length < minLength) {
    return {
      valid: false,
      error: `최소 ${minLength}자 이상 입력해야 합니다.`,
    };
  }

  // XSS 검사
  if (!allowHtml && containsXss(input)) {
    return { valid: false, error: "허용되지 않은 문자가 포함되어 있습니다." };
  }

  // 정리
  const sanitized = allowHtml ? input : sanitizeText(input);

  return { valid: true, sanitized };
}


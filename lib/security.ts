/**
 * 보안 유틸리티 함수
 * XSS 방지, 입력 검증 등
 */

/**
 * HTML 태그 제거 (XSS 방지)
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

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
 * SQL Injection 패턴 검사 (기본적인 패턴만)
 * Prisma를 사용하므로 실제로는 필요 없지만, 추가 보안을 위해
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\bUNION\s+SELECT\b)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
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

  // SQL Injection 검사
  if (containsSqlInjection(input)) {
    return { valid: false, error: "허용되지 않은 문자가 포함되어 있습니다." };
  }

  // XSS 검사
  if (!allowHtml && containsXss(input)) {
    return { valid: false, error: "허용되지 않은 문자가 포함되어 있습니다." };
  }

  // 정리
  const sanitized = allowHtml ? input : sanitizeText(input);

  return { valid: true, sanitized };
}

/**
 * Origin 검증 (CSRF 방지)
 */
export function isValidOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }

  // 개발 환경에서는 localhost 허용
  if (process.env.NODE_ENV === "development") {
    if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      return true;
    }
  }

  return allowedOrigins.some((allowed) => origin.startsWith(allowed));
}


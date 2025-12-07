/**
 * Rate Limiting 유틸리티
 * 메모리 기반 간단한 rate limiter (프로덕션에서는 Redis 사용 권장)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// 메모리 기반 저장소 (프로덕션에서는 Redis 사용 권장)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit 체크
 * @param identifier - IP 주소 또는 사용자 ID
 * @param maxRequests - 최대 요청 수
 * @param windowMs - 시간 윈도우 (밀리초)
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // 기존 엔트리가 없거나 만료된 경우
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // 요청 수가 최대치를 초과한 경우
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // 요청 수 증가
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * IP 주소 추출 (프록시 환경 고려)
 */
export function getClientIP(request: Request): string {
  // X-Forwarded-For 헤더 확인 (Vercel, Cloudflare 등)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // X-Real-IP 헤더 확인
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // 기본값 (개발 환경)
  return "unknown";
}

/**
 * 주기적으로 만료된 엔트리 정리 (메모리 누수 방지)
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // 1분마다 정리
}


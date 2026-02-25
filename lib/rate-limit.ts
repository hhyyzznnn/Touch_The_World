/**
 * Rate Limiting 유틸리티
 * 기본은 메모리 기반, 환경 변수가 있으면 Upstash Redis REST 기반으로 동작합니다.
 */
import crypto from "crypto";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// 메모리 기반 저장소 (프로덕션에서는 Redis 사용 권장)
const rateLimitStore = new Map<string, RateLimitEntry>();
let hasLoggedUpstashFailure = false;

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function fallbackRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

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

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

async function checkRateLimitUpstash(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `rate-limit:${identifier}`;
  const member = `${now}-${crypto.randomUUID()}`;
  const oldestScore = now - windowMs;
  const resetTime = now + windowMs;

  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["ZREMRANGEBYSCORE", key, "-inf", oldestScore.toString()],
      ["ZCARD", key],
      ["ZADD", key, now.toString(), member],
      ["PEXPIRE", key, windowMs.toString()],
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash rate limit failed: ${response.status}`);
  }

  const data = await response.json();
  const currentCount = Number(data?.[1]?.result ?? 0);
  const allowed = currentCount < maxRequests;

  return {
    allowed,
    remaining: allowed ? Math.max(0, maxRequests - (currentCount + 1)) : 0,
    resetTime,
  };
}

/**
 * Rate limit 체크
 * @param identifier - IP 주소 또는 사용자 ID
 * @param maxRequests - 최대 요청 수
 * @param windowMs - 시간 윈도우 (밀리초)
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    try {
      return await checkRateLimitUpstash(identifier, maxRequests, windowMs);
    } catch (error) {
      if (!hasLoggedUpstashFailure) {
        console.error("Upstash Rate Limit 사용 실패, 메모리 모드로 폴백합니다:", error);
        hasLoggedUpstashFailure = true;
      }
    }
  }
  return fallbackRateLimit(identifier, maxRequests, windowMs);
}

/**
 * IP 주소 추출 (프록시 환경 고려)
 */
export function getClientIP(request: Request): string {
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

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
  return "unknown-client";
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

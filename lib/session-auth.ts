import crypto from "crypto";
import { cookies } from "next/headers";

export const AUTH_SESSION_COOKIE = "ttw_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_VERSION = 1;

type SessionRole = "user" | "admin";

interface SessionPayload {
  v: number;
  sub: string;
  role: SessionRole;
  exp: number;
}

interface CookieStoreLike {
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
  delete: (name: string) => void;
  get: (name: string) => { value: string } | undefined;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET 또는 NEXTAUTH_SECRET 환경 변수가 필요합니다.");
  }

  return "dev-only-insecure-session-secret-change-me";
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as SessionPayload;
    if (
      parsed?.v !== SESSION_VERSION ||
      typeof parsed.sub !== "string" ||
      (parsed.role !== "user" && parsed.role !== "admin") ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isValidSignature(encodedPayload: string, signature: string): boolean {
  const expected = signPayload(encodedPayload);
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function createSessionToken(data: { userId: string; role: SessionRole }): string {
  const payload: SessionPayload = {
    v: SESSION_VERSION,
    sub: data.userId,
    role: data.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  if (!isValidSignature(encodedPayload, signature)) return null;
  const payload = decodePayload(encodedPayload);
  if (!payload) return null;

  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function setAuthSession(
  cookieStore: CookieStoreLike,
  data: { userId: string; role: SessionRole }
) {
  const token = createSessionToken(data);
  cookieStore.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export function clearAuthSession(cookieStore: CookieStoreLike) {
  cookieStore.delete(AUTH_SESSION_COOKIE);
  cookieStore.delete("user-id");
  cookieStore.delete("admin-auth");
}

export async function getSessionPayloadFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}


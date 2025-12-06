import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

/**
 * API 라우트에서 관리자 인증을 체크하는 헬퍼 함수
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * API 에러 응답을 생성하는 헬퍼 함수
 */
export function apiError(message: string, status: number = 500, error?: unknown) {
  if (error) {
    console.error(`${message}:`, error);
  }
  return NextResponse.json({ error: message }, { status });
}

/**
 * API 성공 응답을 생성하는 헬퍼 함수
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * 요청 본문을 파싱하고 검증하는 헬퍼 함수
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new Error("Invalid JSON in request body");
  }
}


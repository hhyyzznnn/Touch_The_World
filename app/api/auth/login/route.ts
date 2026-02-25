import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { setAuthSession } from "@/lib/session-auth";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  // Rate Limiting: IP당 1분에 5회 제한
  const clientIP = getClientIP(request);
  const rateLimit = await checkRateLimit(`login:${clientIP}`, 5, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }
    const { identifier, password } = parsed.data;

    const normalizedId = identifier.trim().toLowerCase();

    // 사용자 찾기 (아이디 전용)
    const user = await prisma.user.findUnique({
      where: { username: normalizedId },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 이메일 인증 확인
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: "이메일 인증이 완료되지 않았습니다. 이메일을 확인하여 인증을 완료해주세요.",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // 쿠키 설정
    const cookieStore = await cookies();
    setAuthSession(cookieStore, { userId: user.id, role: user.role === "admin" ? "admin" : "user" });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...(user.role === "admin" && { redirect: "/admin" }),
      },
      {
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인에 실패했습니다." },
      { status: 500 }
    );
  }
}

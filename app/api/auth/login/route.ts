import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: NextRequest) {
  // Rate Limiting: IP당 1분에 5회 제한
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`login:${clientIP}`, 5, 60 * 1000);

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
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "아이디/이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 관리자 계정은 일반 로그인 페이지에서 허용하지 않음
    if (identifier.trim().toLowerCase() === "admin") {
      return NextResponse.json(
        { error: "관리자 로그인은 /admin/login에서만 가능합니다." },
        { status: 403 }
      );
    }

    // 사용자 찾기 (아이디 or 이메일)
    const isEmail = identifier.includes("@");
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
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
    cookieStore.set("user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
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


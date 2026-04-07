import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { setAuthSession } from "@/lib/session-auth";

function normalizeSessionRole(role: string): "user" | "admin" | "editor" {
  if (role === "admin" || role === "editor") return role;
  return "user";
}

/**
 * 구글 로그인 콜백 처리
 * NextAuth 인증 후 우리 시스템 쿠키 설정
 */
export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL("/login?error=no_session", request.url)
      );
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=user_not_found", request.url)
      );
    }

    // 애플리케이션 세션 쿠키 설정
    const cookieStore = await cookies();
    setAuthSession(cookieStore, { userId: user.id, role: normalizeSessionRole(user.role) });

    // 리디렉션 (운영자 계정인 경우 관리자 페이지로)
    if (user.role === "admin" || user.role === "editor") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Google login callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=callback_failed", request.url)
    );
  }
}

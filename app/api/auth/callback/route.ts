import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { setAuthSession } from "@/lib/session-auth";

// 소셜 로그인 콜백 후 우리 시스템 쿠키 설정
export async function GET(request: NextRequest) {
  // 검색 엔진 봇 차단 (robots.txt에서 이미 차단되지만 추가 보안)
  const userAgent = request.headers.get("user-agent") || "";
  const isSearchEngineBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i.test(userAgent);
  
  if (isSearchEngineBot) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login?error=no_session", request.url));
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=user_not_found", request.url));
    }

    // 애플리케이션 세션 쿠키 설정
    const cookieStore = await cookies();
    setAuthSession(cookieStore, { userId: user.id, role: user.role === "admin" ? "admin" : "user" });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Social login callback error:", error);
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url));
  }
}

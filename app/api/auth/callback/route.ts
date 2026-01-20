import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// 소셜 로그인 콜백 후 우리 시스템 쿠키 설정
export async function GET(request: NextRequest) {
  // 검색 엔진 봇 차단 (robots.txt에서 이미 차단되지만 추가 보안)
  const userAgent = request.headers.get("user-agent") || "";
  const isSearchEngineBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i.test(userAgent);
  
  if (isSearchEngineBot) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    // NextAuth 세션에서 사용자 정보 가져오기
    // 실제로는 NextAuth의 세션을 확인해야 하지만,
    // 간단하게 토큰으로 사용자 찾기
    const account = await prisma.account.findFirst({
      where: {
        access_token: token,
      },
      include: {
        user: true,
      },
    });

    if (!account || !account.user) {
      return NextResponse.redirect(new URL("/login?error=user_not_found", request.url));
    }

    // 우리 시스템 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set("user-id", account.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Social login callback error:", error);
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url));
  }
}


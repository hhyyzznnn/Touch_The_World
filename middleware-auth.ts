import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { setAuthSession } from "@/lib/session-auth";

// NextAuth 세션 확인 및 우리 시스템 쿠키 동기화
export async function syncAuthSession(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token && token.sub) {
      // NextAuth 세션이 있으면 애플리케이션 세션 쿠키도 설정
      const response = NextResponse.next();
      setAuthSession(response.cookies, {
        userId: token.sub,
        role: token.role === "admin" ? "admin" : "user",
      });
      return response;
    }
  } catch (error) {
    console.error("Auth sync error:", error);
  }

  return NextResponse.next();
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 스팸봇·외부 잘못된 링크로 인한 404 URL 홈으로 리디렉션
  if (pathname === "/$" || pathname === "/&") {
    return NextResponse.redirect(new URL("/", request.url), { status: 301 });
  }

  const response = NextResponse.next();

  // pathname을 헤더에 추가 (ConditionalFooter에서 사용)
  response.headers.set("x-pathname", pathname);

  // NextAuth API 경로는 통과
  if (pathname.startsWith("/api/auth")) {
    return response;
  }

  // 로그인 페이지는 항상 접근 가능
  if (pathname === "/admin/login" || pathname === "/login" || pathname === "/register") {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

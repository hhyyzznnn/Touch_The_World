import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  
  // pathname을 헤더에 추가 (ConditionalFooter에서 사용)
  response.headers.set("x-pathname", pathname);

  // 로그인 페이지는 항상 접근 가능
  if (pathname === "/admin/login") {
    return response;
  }

  // 관리자 페이지 접근 시 인증 체크
  if (pathname.startsWith("/admin")) {
    const auth = request.cookies.get("admin-auth");
    
    if (auth?.value !== "true") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
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


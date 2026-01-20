import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  
  // pathname을 헤더에 추가 (ConditionalFooter에서 사용)
  response.headers.set("x-pathname", pathname);

  // 검색 엔진 봇 확인 (네이버 Yeti 포함)
  const userAgent = request.headers.get("user-agent") || "";
  const isSearchEngineBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|Yeti/i.test(userAgent);

  // 로그인 페이지는 항상 접근 가능
  if (pathname === "/admin/login") {
    return response;
  }

  // 관리자 페이지 접근 시 인증 체크
  // 검색 엔진 봇은 리디렉션하지 않고 404 또는 빈 페이지 반환
  if (pathname.startsWith("/admin")) {
    const auth = request.cookies.get("admin-auth");
    
    if (auth?.value !== "true") {
      // 검색 엔진 봇인 경우 robots.txt에서 이미 차단되므로 404 반환
      if (isSearchEngineBot) {
        return new NextResponse(null, { status: 404 });
      }
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


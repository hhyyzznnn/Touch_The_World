import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 2026-09 삭제한 SEO 랜딩페이지 4개 — 실제 검색·AI 어시스턴트 유입이 있던 페이지라
// 그냥 404로 두지 않고 가장 관련 있는 카테고리로 301 연결해 유입을 이어받는다.
// next.config.ts의 redirects()로는 목적지에 한글 쿼리가 들어가면 Location 헤더에
// 원문 UTF-8을 그대로 넣으려다 500을 내는 문제가 있어(raw·percent-encoded 둘 다 동일하게
// 실패) 여기서 URL 객체로 직접 만들어 처리한다 — URL의 searchParams는 자동으로
// 올바르게 퍼센트 인코딩해준다.
const DELETED_LANDING_PAGE_REDIRECTS: Record<string, string | null> = {
  "/programs/japan-edu-trip": "국외 교육여행",
  "/programs/school-trip": null,
  "/programs/teacher-training": "교사 연수",
  "/programs/specialized-highschool": "특성화고 프로그램",
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 스팸봇·외부 잘못된 링크로 인한 404 URL 홈으로 리디렉션
  if (pathname === "/$" || pathname === "/&") {
    return NextResponse.redirect(new URL("/", request.url), { status: 301 });
  }

  if (pathname in DELETED_LANDING_PAGE_REDIRECTS) {
    const category = DELETED_LANDING_PAGE_REDIRECTS[pathname];
    const target = new URL("/programs", request.url);
    if (category) target.searchParams.set("category", category);
    return NextResponse.redirect(target, { status: 308 });
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

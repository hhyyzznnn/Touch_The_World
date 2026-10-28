import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROGRAM_CATEGORIES } from "@/lib/news-constants";

// 2026-09 삭제한 SEO 랜딩페이지 4개 — 실제 검색·AI 어시스턴트 유입이 있던 페이지라
// 그냥 404로 두지 않고 가장 관련 있는 카테고리로 301 연결해 유입을 이어받는다.
// next.config.ts의 redirects()로는 목적지에 한글 쿼리가 들어가면 Location 헤더에
// 원문 UTF-8을 그대로 넣으려다 500을 내는 문제가 있어(raw·percent-encoded 둘 다 동일하게
// 실패) 여기서 URL 객체로 직접 만들어 처리한다 — URL의 searchParams는 자동으로
// 올바르게 퍼센트 인코딩해준다.
const DELETED_LANDING_PAGE_REDIRECTS: Record<string, string | null> = {
  "/programs/japan-edu-trip": "일본 교육여행",
  "/programs/school-trip": null,
  "/programs/teacher-training": "교직원 연수·혜택",
  "/programs/specialized-highschool": "특성화고 프로그램",
};

// 2026-09 겹치던 회사소개 카드뉴스 6건 중 콘텐츠 결함(플레이스홀더 문구 노출, 엉뚱한
// 캐릭터 삽입, 표지만 있고 본문 없음)이 있던 3건을 삭제하고 완전판 1건으로 통합.
// 검색·외부 링크로 들어오는 유입은 완전판으로 이어받는다.
const DELETED_NEWS_REDIRECTS: Record<string, string> = {
  "/news/cardnews_touchtheworld_brand_intro_2026": "/news/cardnews_touchtheworld_company_profile_2026",
  "/news/cardnews_company_introduction_2026": "/news/cardnews_touchtheworld_company_profile_2026",
  "/news/cardnews_touchtheworld_9_differentiators": "/news/cardnews_touchtheworld_company_profile_2026",
};

// 예전 카테고리 이름(띄어쓰기 없는 표기, 개편 전 분류)으로 들어오는 /programs?category= 주소.
// 그대로 두면 전부 "프로그램 카드뉴스"라는 같은 제목의 페이지로 남아 검색엔진 진단에 중복으로 잡힌다.
// 2026-10-28 재정비 때 없어진 이름(국외 교육여행·교사 연수·기타 프로그램)도 여기서 이어받는다.
// 값이 ""이면 전체 목록으로 보낸다.
const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  "국외교육여행": "일본 교육여행",
  "해외교육여행": "해외 교육여행",
  "국내외교육여행": "일본 교육여행",
  "국내수학여행": "국내 교육여행",
  "교사연수": "교직원 연수·혜택",
  "교직원연수": "교직원 연수·혜택",
  "특성화고교육여행": "특성화고 프로그램",
  "특성화고교프로그램": "특성화고 프로그램",
  "해외취업및유학": "일본 유학",
  "기타프로그램": "",
  "기타": "",
};

// 유효하면 null, 아니면 옮겨갈 카테고리 이름(없으면 "" → 전체 목록)
function resolveLegacyCategory(category: string): string | null {
  if ((PROGRAM_CATEGORIES as readonly string[]).includes(category)) return null;
  const compact = category.replace(/\s+/g, "");
  return (
    PROGRAM_CATEGORIES.find((cat) => cat.replace(/\s+/g, "") === compact) ??
    LEGACY_CATEGORY_ALIASES[compact] ??
    ""
  );
}

// URL.searchParams는 공백을 +로 적는데, 사이트 안의 카테고리 링크·사이트맵은 %20을 쓴다. 같은 표기로 맞춘다.
function programsUrl(request: NextRequest, category: string | null) {
  const target = new URL("/programs", request.url);
  target.search = category ? `?category=${encodeURIComponent(category)}` : "";
  return target;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 스팸봇·외부 잘못된 링크로 인한 404 URL 홈으로 리디렉션
  if (pathname === "/$" || pathname === "/&") {
    return NextResponse.redirect(new URL("/", request.url), { status: 301 });
  }

  if (pathname in DELETED_LANDING_PAGE_REDIRECTS) {
    const category = DELETED_LANDING_PAGE_REDIRECTS[pathname];
    return NextResponse.redirect(programsUrl(request, category), { status: 308 });
  }

  if (pathname === "/programs") {
    const category = request.nextUrl.searchParams.get("category");
    if (category !== null) {
      const replacement = resolveLegacyCategory(category);
      if (replacement !== null) {
        return NextResponse.redirect(programsUrl(request, replacement), { status: 308 });
      }
    }
  }

  if (pathname in DELETED_NEWS_REDIRECTS) {
    return NextResponse.redirect(new URL(DELETED_NEWS_REDIRECTS[pathname], request.url), { status: 308 });
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

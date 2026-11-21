import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { List, ChevronRight } from "lucide-react";
import { InquiryDropdownButton } from "@/components/inquiry/InquiryDropdownButton";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Image from "next/image";
import { getEventThumbnailUrl, getEventThumbnailPosition } from "@/lib/event-utils";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { DynamicHeroChat } from "@/components/home/DynamicHeroChat";
import { NewsTicker } from "@/components/NewsTicker";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { SchoolLogoMarquee } from "@/components/home/SchoolLogoMarquee";
import { StatsSection } from "@/components/home/StatsSection";
import { isRecentlyAdded, stripBrandFromTitle } from "@/lib/news-utils";
import { CardNewsLink } from "@/components/home/CardNewsLink";
import { HomeNoticeBar } from "@/components/home/HomeNoticeBar";
import { HomePopup } from "@/components/home/HomePopup";
import { MembershipBanner } from "@/components/home/MembershipBanner";

export const metadata: Metadata = {
  title: "터치더월드 | 교육여행·수학여행·교사연수 전문 여행사",
  description:
    "터치더월드는 교육여행, 수학여행, 교사연수, 해외연수를 전문으로 기획·운영하는 교육여행 전문 여행사입니다.",
  keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS),
  alternates: { canonical: "/" },
  openGraph: {
    title: "터치더월드 | 교육여행·수학여행·교사연수 전문 여행사",
    description:
      "학교·지자체 맞춤형 교육여행과 체험학습, 교사연수·해외연수를 운영하는 터치더월드의 프로그램을 확인하세요.",
    url: "/",
    siteName: "터치더월드",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/images/og_image3.png", width: 1376, height: 768, alt: "터치더월드 | 교육여행 전문" }],
  },
};


const EVENT_IMAGE_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

async function getNewsForTicker() {
  try {
    return await prisma.companyNews.findMany({
      where: { type: "COMPANY_NEWS" },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: { id: true, title: true, link: true, isPinned: true },
    });
  } catch {
    return [];
  }
}

const CARD_NEWS_TAKE = 4;

async function getCardNewsForHome() {
  try {
    // 메인 화면은 "최신 소식"을 보여주는 자리라 최신순 그대로 노출한다.
    // isPinned는 /news, /programs 카탈로그에서 특정 카드(예: 회사소개서)를 목록 맨 위에
    // 고정해두기 위한 용도라, 여기서 우선 적용하면 오래된 고정 카드가 계속 "최신"처럼 보인다.
    return await prisma.companyNews.findMany({
      where: { type: "PROGRAM_CARD_NEWS", imageUrl: { not: null } },
      orderBy: { createdAt: "desc" },
      take: CARD_NEWS_TAKE,
      select: {
        id: true, title: true, summary: true, imageUrl: true,
        link: true, isPinned: true, createdAt: true, categories: true, hashtags: true,
      },
    });
  } catch {
    return [];
  }
}

async function getRecentEvents() {
  try {
    return await prisma.event.findMany({
      take: 5,
      select: {
        id: true,
        date: true,
        school: { select: { name: true } },
        program: { select: { title: true, category: true } },
        summaryCardUrl: true,
        images: { take: 1, orderBy: { createdAt: "asc" }, select: { url: true } },
      },
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

// 맨 위 한 줄 알림은 혜택 안내 위주의 홍보 소식만 노출하는 자리라, "최신 COMPANY_NEWS 아무거나"가
// 아니라 관리자가 명시적으로 "메인 페이지에 노출"(isPinned) 체크한 것만 후보로 삼는다.
// (예전엔 이 조건이 없어서 인문학 콘텐츠 같은 일반 카드뉴스도 최신이면 그대로 팝업을 가로챘었음)
async function getPopupNews() {
  try {
    return await prisma.companyNews.findFirst({
      where: { type: "COMPANY_NEWS", imageUrl: { not: null }, isPinned: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, summary: true, imageUrl: true, link: true },
    });
  } catch {
    return null;
  }
}

/** 지금 홈페이지에 올라가 있는 프로그램 카드뉴스 수 — 메인 수치 칸에 쓴다 */
async function getProgramCount() {
  try {
    return await prisma.companyNews.count({ where: { type: "PROGRAM_CARD_NEWS" } });
  } catch {
    return null;
  }
}

export const revalidate = 600;

export default async function HomePage() {
  const [recentEvents, newsTickerItems, cardNewsItems, popupNews, programCount] = await Promise.all([
    getRecentEvents(),
    getNewsForTicker(),
    getCardNewsForHome(),
    getPopupNews(),
    getProgramCount(),
  ]);

  return (
    <div>
      {/* ── 첫 방문 팝업(실제 방문자 브라우저에서만) + 맨 위 한 줄 알림(팝업을 닫은 뒤에도 남음) ── */}
      {popupNews && (
        <>
          {popupNews.imageUrl && (
            <HomePopup
              id={popupNews.id}
              title={stripBrandFromTitle(popupNews.title)}
              summary={popupNews.summary ?? ""}
              imageUrl={popupNews.imageUrl}
              link={popupNews.link}
            />
          )}
          <HomeNoticeBar id={popupNews.id} title={stripBrandFromTitle(popupNews.title)} link={popupNews.link} />
        </>
      )}

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-brand-green/5 to-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-medium tracking-wide mb-2 sm:mb-4">
              <span className="text-brand-green-primary">TOUCH</span>{" "}
              <span className="text-text-dark">THE WORLD</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-text-dark" style={{ lineHeight: "1.4", letterSpacing: "-0.02em" }}>
              <span className="block">안전과 교육의 가치를 실현하는</span>
              <span className="block">프리미엄 교육여행 파트너</span>
            </p>
            <p className="text-sm sm:text-base md:text-lg text-text-gray leading-relaxed">
              <span className="block">교육자의 시간을 절약하고,</span>
              <span className="block">학습자의 세계를 확장합니다.</span>
            </p>

            <div className="pt-4 sm:pt-6">
              <Suspense fallback={<div className="h-[315px] sm:h-[248px] w-full max-w-3xl mx-auto rounded-2xl bg-gray-100 animate-pulse" />}>
                <DynamicHeroChat />
              </Suspense>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center pt-4 sm:pt-6">
              <Button
                asChild
                size="lg"
                className="bg-brand-green-primary hover:bg-brand-green-primary/90 hover:scale-[1.02] text-white px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg rounded-xl shadow-sm transition-all duration-200 min-h-11"
              >
                <Link href="/programs" className="flex items-center justify-center gap-2 sm:gap-3">
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  전체 프로그램
                </Link>
              </Button>
              <InquiryDropdownButton />
            </div>
          </div>
        </div>
      </section>

      {/* ── 프로그램 8개 분야 — 첫 화면 바로 아래(예전 카드뉴스 자리, 2026-11-20) ── */}
      <section className="pt-0 pb-10 sm:pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark">
              어떤 프로그램이 필요하신가요?
            </h2>
            <p className="mt-2 text-sm text-text-gray">프로그램을 선택하면 맞춤 견적을 받을 수 있습니다</p>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* ── 교사 멤버십 안내 ── */}
      <MembershipBanner />

      {/* ── Stats (숫자 애니메이션) ── */}
      <StatsSection programCount={programCount} />

      {/* ── 회사 소식 ── */}
      <NewsTicker items={newsTickerItems} />

      {/* ── 카드뉴스 — 예전 8개 분야 자리(2026-11-20), 맨 앞 쇼츠 영상 칸은 2026-11-21 제거 ── */}
      {cardNewsItems.length > 0 && (
        <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-start justify-between mb-5 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark">카드뉴스</h2>
                <p className="mt-1 text-xs sm:text-sm text-text-gray">최신 교육여행 트렌드와 프로그램을 미리 확인하세요</p>
              </div>
              <Link
                href="/programs"
                className="text-brand-green-primary hover:text-brand-green/80 font-medium flex items-center gap-1 text-sm sm:text-base flex-shrink-0 mt-1"
              >
                {/* 검색엔진·화면 낭독기가 "전체 보기"만 읽지 않도록 무엇의 전체인지 숨은 글자로 덧붙인다 */}
                <span className="sr-only">카드뉴스 </span>전체 보기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-px-4 [touch-action:pan-x] overscroll-x-contain [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] lg:overflow-visible lg:mx-0 lg:px-0 lg:[mask-image:none]">
                <div className="flex snap-x snap-mandatory flex-nowrap items-start gap-3 lg:gap-5 pb-2 lg:grid lg:grid-cols-4 lg:pb-0">

              {cardNewsItems.map((item, cardIndex) => {
                const href = item.link?.trim() || `/news/${item.id}`;
                const isExternal = !!item.link?.trim()?.startsWith("http");
                const isNew = isRecentlyAdded(item.createdAt);
                const regionTag = item.hashtags.find((t) =>
                  ["#서울","#인천","#포천","#가평","#충남","#일본","#해외","#국내"].includes(t)
                ) ?? null;
                const showTagRow = isNew || item.categories.length > 0 || !!regionTag;

                return (
                  <CardNewsLink
                    key={item.id}
                    href={href}
                    title={item.title}
                    isExternal={isExternal}
                    className={`snap-start flex-shrink-0 w-[calc(50vw-2rem)] sm:w-[calc(33vw-1rem)] md:w-[calc(25vw-1rem)] lg:w-auto aspect-[9/16] flex flex-col group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow`}
                  >
                    <div className="relative flex-1 bg-gray-50 min-h-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          // 바로 아래 카드 제목과 같은 문구가 되지 않게 (화면 낭독기가 두 번 읽음)
                          alt={`${item.title} 카드뉴스 표지`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          className="object-contain group-hover:scale-[1.03] transition-transform duration-200"
                          priority={cardIndex === 0}
                        />
                      ) : (
                        <ImagePlaceholder text="카드뉴스" className="text-xs" />
                      )}
                      {/* 태그 — 이미지 위 오버레이 */}
                      {showTagRow && (
                        <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1">
                          {isNew && (
                            <span className="rounded bg-brand-green-primary text-white px-2 py-0.5 text-xs font-bold shadow-sm">
                              NEW
                            </span>
                          )}
                          {item.categories.slice(0, 1).map((cat) => (
                            <span key={cat} className="rounded-full bg-white/85 backdrop-blur-sm text-brand-green-primary px-2 py-0.5 text-xs font-medium shadow-sm">
                              #{cat}
                            </span>
                          ))}
                          {regionTag && (
                            <span className="rounded-full bg-white/85 backdrop-blur-sm text-text-gray px-2 py-0.5 text-xs shadow-sm">
                              {regionTag}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 p-3">
                      <p className="text-xs sm:text-sm font-medium text-text-dark line-clamp-2">{stripBrandFromTitle(item.title)}</p>
                      {item.summary && (
                        <p className="mt-0.5 text-xs text-text-gray line-clamp-1">{item.summary}</p>
                      )}
                    </div>
                  </CardNewsLink>
                );
              })}
                </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 함께한 학교들 ── */}
      <section className="py-10 sm:py-14 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 mb-6 sm:mb-8 text-center">
          <p className="text-xs sm:text-sm text-text-gray tracking-widest uppercase mb-1">Partners</p>
          <h2 className="text-lg sm:text-xl font-medium text-text-dark">함께한 학교들</h2>
        </div>
        <SchoolLogoMarquee />
      </section>

      {/* ── 최근 행사 ── */}
      <section className="py-10 sm:py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark">
              최근 진행 행사
            </h2>
            <Link
              href="/events"
              className="text-brand-green-primary hover:text-brand-green/80 font-medium flex items-center gap-1 text-sm sm:text-base"
            >
              더보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-text-gray mb-3 sm:mb-4 sm:hidden">
            좌우로 스와이프해 최근 행사를 확인하세요.
          </p>
          {recentEvents.length > 0 ? (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent sm:w-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent sm:w-10" />
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-px-4 [touch-action:pan-x] overscroll-x-contain">
                <div className="flex snap-x snap-mandatory flex-nowrap gap-4 sm:gap-6 pb-2 sm:pb-3">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="snap-start border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white min-w-[82vw] sm:min-w-[360px] md:min-w-[400px] max-w-[400px] flex-shrink-0"
                      aria-label={`${event.school.name} 최근 행사 보기`}
                    >
                      {getEventThumbnailUrl(event) ? (
                        <div className="relative w-full h-36 sm:h-48 bg-gray-100">
                          <Image
                            src={getEventThumbnailUrl(event)!}
                            alt={`${event.school.name} 행사`}
                            fill
                            sizes="(max-width: 768px) 80vw, 400px"
                            quality={90}
                            className={`object-cover ${getEventThumbnailPosition(event)}`}
                            loading="lazy"
                            decoding="async"
                            placeholder="blur"
                            blurDataURL={EVENT_IMAGE_BLUR_DATA_URL}
                          />
                        </div>
                      ) : (
                        <ImagePlaceholder className="h-36 sm:h-48 text-sm" text="현장 사진" />
                      )}
                      <div className="p-4 sm:p-6">
                        <div className="text-xs sm:text-sm text-brand-green-primary font-medium mb-1 sm:mb-2">
                          {getCategoryDisplayName(event.program.category)}
                        </div>
                        <div className="text-xs sm:text-sm text-text-gray mb-1 sm:mb-2">
                          {format(new Date(event.date), "yyyy.MM.dd")}
                        </div>
                        <div className="text-sm sm:text-base font-medium text-text-dark mb-1 sm:mb-2">
                          {event.school.name}
                        </div>
                        <div className="text-xs sm:text-sm text-text-gray line-clamp-1">
                          {event.program.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-text-gray text-sm sm:text-base">
              등록된 행사가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

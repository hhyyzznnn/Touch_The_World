import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { List, Shield, Lightbulb, Settings, ChevronRight } from "lucide-react";
import { InquiryDropdownButton } from "@/components/inquiry/InquiryDropdownButton";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Image from "next/image";
import { COMPANY_INFO } from "@/lib/constants";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { HeroChatInputWrapper } from "@/components/HeroChatInputWrapper";
import { NewsTicker } from "@/components/NewsTicker";
import { getPersonalizedGreeting } from "@/lib/greeting";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { SchoolLogoMarquee } from "@/components/home/SchoolLogoMarquee";
import { StatsSection } from "@/components/home/StatsSection";
import { SHORTS_VIDEOS } from "@/lib/shorts-videos";

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
    images: [{ url: "/images/og_image2.png", width: 1376, height: 768, alt: "터치더월드 | 교육여행 전문" }],
  },
};

const EVENT_IMAGE_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

async function getNewsForTicker() {
  try {
    return await prisma.companyNews.findMany({
      where: { type: "COMPANY_NEWS" },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 1,
      select: { id: true, title: true, link: true },
    });
  } catch {
    return [];
  }
}

const CARD_NEWS_TAKE = SHORTS_VIDEOS.length > 0 ? 3 : 4;

async function getCardNewsForHome() {
  try {
    return await prisma.companyNews.findMany({
      where: { type: "PROGRAM_CARD_NEWS", imageUrl: { not: null } },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: CARD_NEWS_TAKE,
      select: {
        id: true, title: true, summary: true, imageUrl: true,
        link: true, isPinned: true, createdAt: true, category: true, hashtags: true,
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
      include: {
        school: { select: { id: true, name: true } },
        program: { select: { id: true, title: true, category: true } },
        images: { take: 1, orderBy: { createdAt: "asc" } },
      },
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

export const revalidate = 600;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [recentEvents, newsTickerItems, cardNewsItems, greeting] = await Promise.all([
    getRecentEvents(),
    getNewsForTicker(),
    getCardNewsForHome(),
    getPersonalizedGreeting(),
  ]);

  return (
    <div>
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
              <HeroChatInputWrapper category={resolvedSearchParams?.category} greeting={greeting} />
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

      {/* ── Stats (숫자 애니메이션) ── */}
      <StatsSection />

      {/* ── 회사 소식 ── */}
      <NewsTicker items={newsTickerItems} />

      {/* ── 카드뉴스 (영상 첫 칸 통합) ── */}
      {(cardNewsItems.length > 0 || SHORTS_VIDEOS.length > 0) && (
        <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark">카드뉴스</h2>
              <Link
                href="/news"
                className="text-brand-green hover:text-brand-green/80 font-medium flex items-center gap-1 text-sm sm:text-base"
              >
                전체 보기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

              {/* 쇼츠 영상 — 첫 번째 칸 (9:16 전체, 텍스트 영역 없음) */}
              {SHORTS_VIDEOS[0] && (() => {
                const video = SHORTS_VIDEOS[0];
                const inner = (
                  <div className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-gray-900 border border-gray-200 hover:shadow-md transition-shadow">
                    <video
                      src={video.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                    <p className="absolute inset-x-0 bottom-3 px-3 text-white text-sm font-medium line-clamp-2 leading-snug">
                      {video.title}
                    </p>
                  </div>
                );
                return video.href
                  ? <Link key="shorts-video" href={video.href}>{inner}</Link>
                  : <div key="shorts-video">{inner}</div>;
              })()}

              {cardNewsItems.map((item) => {
                const href = item.link?.trim() || `/news/${item.id}`;
                const isExternal = !!item.link?.trim()?.startsWith("http");
                const categoryTag = item.category
                  ? `#${item.category}`
                  : item.hashtags.find(
                      (t) =>
                        !["#서울","#인천","#포천","#가평","#충남","#일본","#해외","#초등","#중등","#고등","#특성화고"].includes(t)
                    );
                const regionTag = item.hashtags.find((t) =>
                  ["#서울","#인천","#포천","#가평","#충남","#일본","#해외"].includes(t)
                );
                const tags = [categoryTag, regionTag].filter(Boolean).slice(0, 2) as string[];

                return (
                  <Link
                    key={item.id}
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[4/5] bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-200"
                        />
                      ) : (
                        <ImagePlaceholder text="카드뉴스" className="text-xs" />
                      )}
                      {item.isPinned && (
                        <span className="absolute top-2 left-2 inline-flex items-center rounded bg-brand-green-primary px-2 py-0.5 text-xs font-bold text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-sm sm:text-base font-medium text-text-dark line-clamp-2">{item.title}</p>
                      {item.summary && (
                        <p className="mt-1 text-xs sm:text-sm text-text-gray line-clamp-2">{item.summary}</p>
                      )}
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-brand-green-primary/10 text-brand-green-primary px-2.5 py-0.5 text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SEO 소개 ── */}
      <section className="py-8 sm:py-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark mb-4">
              교육여행·수학여행·교사연수·해외연수 전문, 터치더월드
            </h2>
            <p className="mx-auto max-w-4xl text-sm sm:text-base text-text-gray leading-relaxed break-keep">
              터치더월드(Touch The World, touchtheworld)는 학교와 지자체의 교육 목표에 맞춰
              <br className="hidden sm:block" />
              체험학습, 수학여행, 교사연수, 해외연수를 설계·운영하는 교육여행 전문 여행사입니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 프로그램 유형 ── */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark mb-6 sm:mb-12 text-center">
            | 프로그램 유형을 선택하세요
          </h2>
          <CategoryGrid />
        </div>
      </section>

      {/* ── 핵심 가치 ── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto mb-6 sm:mb-10">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="inline-flex items-center rounded-full border border-brand-green/20 bg-brand-green/5 px-3 py-1 text-text-dark">
                {COMPANY_INFO.founded} 설립
              </span>
              <span className="inline-flex items-center rounded-full border border-brand-green/20 bg-brand-green/5 px-3 py-1 text-text-dark">
                학교·지자체 특화
              </span>
              <Link
                href="/achievements"
                className="inline-flex items-center rounded-full border border-brand-green/30 bg-white px-3 py-1 text-brand-green hover:bg-brand-green/5 transition-colors"
              >
                실적 보기
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: Shield,
                title: "안전 최우선",
                desc: "사전 답사와 안전 점검을 바탕으로 참가자 전원의 안전을 최우선으로 운영합니다.",
              },
              {
                icon: Lightbulb,
                title: "교육 목표 지향",
                desc: "학교의 교육 목표에 맞춰 현장 중심의 맞춤형 프로그램을 설계합니다.",
              },
              {
                icon: Settings,
                title: "운영 전문성",
                desc: "기획부터 인솔, 사후 정리까지 전 과정을 체계적으로 관리합니다.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-4 sm:p-8">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                  <Icon className="w-7 h-7 sm:w-10 sm:h-10 text-brand-green" />
                </div>
                <h3 className="text-lg sm:text-2xl font-medium text-text-dark mb-2 sm:mb-4">{title}</h3>
                <p className="mx-auto max-w-[30ch] break-keep text-text-gray text-sm sm:text-base leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              | 최근 진행 행사
            </h2>
            <Link
              href="/events"
              className="text-brand-green hover:text-brand-green/80 font-medium flex items-center gap-1 text-sm sm:text-base"
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
                      {event.images[0] ? (
                        <div className="relative w-full h-36 sm:h-48 bg-gray-100">
                          <Image
                            src={event.images[0].url}
                            alt={`${event.school.name} 행사`}
                            fill
                            sizes="(max-width: 768px) 80vw, 400px"
                            className="object-cover"
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
                        <div className="text-xs sm:text-sm text-brand-green font-medium mb-1 sm:mb-2">
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

import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  List,
  ChevronRight,
  Shield,
  Lightbulb,
  Settings,
  ArrowRight,
} from "lucide-react";
import { InquiryDropdownButton } from "@/components/InquiryDropdownButton";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Image from "next/image";
import { PROGRAM_CATEGORIES, COMPANY_INFO } from "@/lib/constants";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { HeroChatInputWrapper } from "@/components/HeroChatInputWrapper";
import { NewsTicker } from "@/components/NewsTicker";
import { getPersonalizedGreeting } from "@/lib/greeting";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { StatsSection } from "@/components/home/StatsSection";
import { FloatingCTA } from "@/components/home/FloatingCTA";
import { ScrollReveal } from "@/components/home/ScrollReveal";

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
      select: { id: true, title: true, summary: true, link: true, isPinned: true, createdAt: true },
    });
  } catch {
    return [];
  }
}

async function getCardNewsForHome() {
  try {
    return await prisma.companyNews.findMany({
      where: { type: "PROGRAM_CARD_NEWS", imageUrl: { not: null } },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 4,
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
      take: 3,
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
  searchParams?: Promise<{ category?: string; copy?: "a" | "b" }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [recentEvents, newsTickerItems, cardNewsItems, greeting] = await Promise.all([
    getRecentEvents(),
    getNewsForTicker(),
    getCardNewsForHome(),
    getPersonalizedGreeting(),
  ]);

  const copyVariant = resolvedSearchParams?.copy === "b" ? "b" : "a";
  const heroHeadline =
    copyVariant === "b"
      ? "학교 맞춤형\n교육여행의 완성."
      : "아이들의 세계를\n더 넓게.";
  const heroSub =
    copyVariant === "b"
      ? "계획부터 현장 운영, 사후 정리까지 교육자가 핵심에만 집중할 수 있게 돕습니다."
      : "수학여행부터 교사연수까지, 1996년부터 교육의 현장을 완성해온 터치더월드입니다.";

  return (
    <div className="overflow-x-hidden">
      <FloatingCTA />

      {/* ── Hero ── */}
      <section
        className="relative min-h-[88vh] sm:min-h-[82vh] flex items-center"
        style={{ background: "linear-gradient(135deg, #071510 0%, #0e2319 55%, #071510 100%)" }}
      >
        {/* dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #2E6D45 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* center glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(46,109,69,0.25),transparent_65%)]" />

        <div className="relative container mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs sm:text-sm text-white/70 mb-8 backdrop-blur-sm">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              {COMPANY_INFO.founded} 창립 · 교육여행 전문 여행사
            </div>

            {/* headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-medium leading-[1.1] tracking-tight text-white mb-6">
              {heroHeadline.split("\n").map((line, i) => (
                <span key={i} className={`block ${i === heroHeadline.split("\n").length - 1 ? "text-brand-green" : ""}`}>
                  {line}
                </span>
              ))}
            </h1>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-10 max-w-xl mx-auto">
              {heroSub}
            </p>

            {/* chatbot */}
            <div className="mb-4">
              <HeroChatInputWrapper category={resolvedSearchParams?.category} greeting={greeting} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                asChild
                size="lg"
                className="bg-white text-text-dark hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-base rounded-xl font-medium transition-all duration-200"
              >
                <Link href="/programs" className="flex items-center justify-center gap-2">
                  <List className="w-4 h-4" />
                  전체 프로그램
                </Link>
              </Button>
              <InquiryDropdownButton dark />
            </div>
          </div>
        </div>

        {/* bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats ── */}
      <StatsSection />

      {/* ── News Ticker ── */}
      <NewsTicker items={newsTickerItems} />

      {/* ── Card News ── */}
      {cardNewsItems.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-8 sm:mb-12">
                <div>
                  <p className="text-xs text-text-gray tracking-widest uppercase mb-2">Card News</p>
                  <h2 className="text-2xl sm:text-3xl font-medium text-text-dark">카드뉴스</h2>
                </div>
                <Link
                  href="/news"
                  className="flex items-center gap-1 text-sm text-brand-green-primary hover:gap-2 transition-all duration-200 font-medium"
                >
                  전체 보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {cardNewsItems.map((item, i) => {
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
                  <ScrollReveal key={item.id} delay={i * 0.08}>
                    <Link
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="group block overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-[4/5] bg-gray-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          />
                        ) : (
                          <ImagePlaceholder text="카드뉴스" className="text-xs" />
                        )}
                        {item.isPinned && (
                          <span className="absolute top-2.5 left-2.5 inline-flex items-center rounded-full bg-brand-green-primary px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
                            NEW
                          </span>
                        )}
                        {tags.length > 0 && (
                          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-brand-green-primary/75 px-2.5 py-0.5 text-[10px] text-white backdrop-blur-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-sm sm:text-base font-medium text-text-dark line-clamp-2 group-hover:text-brand-green-primary transition-colors duration-200">
                          {item.title}
                        </p>
                        {item.summary && (
                          <p className="mt-1 text-xs text-text-gray line-clamp-2">{item.summary}</p>
                        )}
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SEO intro ── */}
      <section className="py-10 sm:py-12 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="mx-auto max-w-3xl text-sm sm:text-base text-text-gray leading-relaxed break-keep">
            <strong className="text-text-dark font-medium">터치더월드(Touch The World)</strong>는 학교와 지자체의 교육 목표에 맞춰
            체험학습, 수학여행, 교사연수, 해외연수를 설계·운영하는 교육여행 전문 여행사입니다.
          </p>
        </div>
      </section>

      {/* ── Program Categories ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-xs text-text-gray tracking-widest uppercase mb-2">Programs</p>
              <h2 className="text-2xl sm:text-3xl font-medium text-text-dark">프로그램 유형</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {PROGRAM_CATEGORIES.map((category, i) => {
              const Icon = category.icon;
              return (
                <ScrollReveal key={category.name} delay={i * 0.06}>
                  <Link
                    href={category.href}
                    className="group flex flex-col items-center justify-center p-5 sm:p-7 rounded-2xl bg-gray-50 hover:bg-brand-green-primary hover:shadow-lg hover:shadow-brand-green-primary/20 hover:-translate-y-1 transition-all duration-300 min-h-[130px] sm:min-h-[148px]"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center mb-3 transition-colors duration-300 shadow-sm group-hover:shadow-none">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-brand-green-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-center text-xs sm:text-sm font-medium text-text-dark group-hover:text-white transition-colors duration-300 leading-snug whitespace-pre-line break-keep">
                      {category.name}
                    </span>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Core Values (dark section) ── */}
      <section
        className="py-16 sm:py-24 relative"
        style={{ background: "linear-gradient(135deg, #071510 0%, #0e2319 55%, #071510 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #2E6D45 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-xs text-white/40 tracking-widest uppercase mb-2">Why Touch The World</p>
              <h2 className="text-2xl sm:text-3xl font-medium text-white">터치더월드를 선택하는 이유</h2>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {["1996년 설립", "30년 업력", "학교·지자체 특화", "전국 네트워크"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
              >
                {tag}
              </span>
            ))}
            <Link
              href="/achievements"
              className="inline-flex items-center rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1 text-xs text-brand-green hover:bg-brand-green/20 transition-colors"
            >
              사업 실적 보기 <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: "안전 최우선",
                desc: "사전 답사와 안전 점검을 바탕으로 참가자 전원의 안전을 최우선으로 운영합니다.",
                delay: 0,
              },
              {
                icon: Lightbulb,
                title: "교육 목표 지향",
                desc: "학교의 교육 목표에 맞춰 현장 중심의 맞춤형 프로그램을 설계합니다.",
                delay: 0.1,
              },
              {
                icon: Settings,
                title: "운영 전문성",
                desc: "기획부터 인솔, 사후 정리까지 전 과정을 체계적으로 관리합니다.",
                delay: 0.2,
              },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <ScrollReveal key={title} delay={delay}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm hover:bg-white/8 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-green-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-green" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed break-keep">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Schools Marquee ── */}
      <section className="py-14 sm:py-18 bg-white overflow-hidden">
        <ScrollReveal>
          <div className="container mx-auto px-4 mb-8 text-center">
            <p className="text-xs text-text-gray tracking-widest uppercase mb-2">Partners</p>
            <h2 className="text-xl sm:text-2xl font-medium text-text-dark">함께한 학교들</h2>
          </div>
        </ScrollReveal>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10" />
          <div
            className="flex items-center gap-10 sm:gap-16 w-max"
            style={{ animation: "marquee 28s linear infinite" }}
          >
            {[
              { src: "/logos/schools/hanyang-foreign-high.png", name: "한영외고" },
              { src: "/logos/schools/anyang-foreign-high.jpeg", name: "안양외고" },
              { src: "/logos/schools/geunmyung.png", name: "근명중학교" },
              { src: "/logos/schools/changmun-girls-high.jpeg", name: "창문여고" },
              { src: "/logos/schools/keumcheon-high.png", name: "금천고등학교" },
              { src: "/logos/schools/hangang-media-high.jpg", name: "한강미디어고" },
              { src: "/logos/schools/gachon-university.webp", name: "가천대학교" },
              { src: "/logos/schools/pyeongtaek-meister-high.webp", name: "평택마이스터고" },
              { src: "/logos/schools/hanyang-foreign-high.png", name: "한영외고" },
              { src: "/logos/schools/anyang-foreign-high.jpeg", name: "안양외고" },
              { src: "/logos/schools/geunmyung.png", name: "근명중학교" },
              { src: "/logos/schools/changmun-girls-high.jpeg", name: "창문여고" },
              { src: "/logos/schools/keumcheon-high.png", name: "금천고등학교" },
              { src: "/logos/schools/hangang-media-high.jpg", name: "한강미디어고" },
              { src: "/logos/schools/gachon-university.webp", name: "가천대학교" },
              { src: "/logos/schools/pyeongtaek-meister-high.webp", name: "평택마이스터고" },
            ].map((school, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <Image src={school.src} alt={school.name} fill sizes="64px" className="object-contain" />
                </div>
                <span className="text-[10px] sm:text-xs text-text-gray whitespace-nowrap">{school.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Events ── */}
      <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-8 sm:mb-12">
              <div>
                <p className="text-xs text-text-gray tracking-widest uppercase mb-2">Recent Events</p>
                <h2 className="text-2xl sm:text-3xl font-medium text-text-dark">최근 진행 행사</h2>
              </div>
              <Link
                href="/events"
                className="flex items-center gap-1 text-sm text-brand-green-primary hover:gap-2 transition-all duration-200 font-medium"
              >
                더보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
          <p className="text-xs text-text-gray mb-4 sm:hidden">좌우로 스와이프해 확인하세요.</p>
          {recentEvents.length > 0 ? (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-50 to-transparent sm:w-10 z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 to-transparent sm:w-10 z-10" />
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-px-4 [touch-action:pan-x] overscroll-x-contain">
                <div className="flex snap-x snap-mandatory flex-nowrap gap-4 sm:gap-5 pb-2">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="snap-start group rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 min-w-[82vw] sm:min-w-[340px] md:min-w-[380px] max-w-[380px] flex-shrink-0"
                      aria-label={`${event.school.name} 최근 행사 보기`}
                    >
                      {event.images[0] ? (
                        <div className="relative w-full h-44 sm:h-52 bg-gray-100 overflow-hidden">
                          <Image
                            src={event.images[0].url}
                            alt={`${event.school.name} 행사`}
                            fill
                            sizes="(max-width: 768px) 80vw, 380px"
                            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                            placeholder="blur"
                            blurDataURL={EVENT_IMAGE_BLUR_DATA_URL}
                          />
                        </div>
                      ) : (
                        <ImagePlaceholder className="h-44 sm:h-52 text-sm" text="현장 사진" />
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-brand-green-primary bg-brand-green-primary/8 px-2.5 py-0.5 rounded-full">
                            {getCategoryDisplayName(event.program.category)}
                          </span>
                          <span className="text-xs text-text-gray">
                            {format(new Date(event.date), "yyyy.MM.dd")}
                          </span>
                        </div>
                        <div className="text-base font-medium text-text-dark">{event.school.name}</div>
                        <div className="text-sm text-text-gray mt-0.5 line-clamp-1">{event.program.title}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-text-gray text-sm">등록된 행사가 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { CompanyNewsType } from "@prisma/client";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { isRecentlyAdded, stripBrandFromTitle } from "@/lib/news-utils";

export const metadata: Metadata = {
  title: "프로그램 카드뉴스 | 터치더월드",
  description:
    "터치더월드의 교육여행·수학여행·교사연수 프로그램 카드뉴스를 확인하세요.",
  alternates: {
    canonical: "/news",
  },
};

const FILTER_TABS = [
  { label: "전체", value: "all" },
  { label: "국내", value: "국내" },
  { label: "해외", value: "해외" },
  { label: "일본", value: "일본" },
] as const;


async function getCardNews(tag: string) {
  const where =
    tag === "all"
      ? { type: CompanyNewsType.PROGRAM_CARD_NEWS, imageUrl: { not: null } }
      : {
          type: CompanyNewsType.PROGRAM_CARD_NEWS,
          imageUrl: { not: null },
          hashtags: { has: `#${tag}` },
        };

  return await prisma.companyNews.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, imageUrl: true, link: true,
      category: true, hashtags: true, isPinned: true, createdAt: true,
    },
  });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag: rawTag } = await searchParams;
  const activeTag = FILTER_TABS.some((t) => t.value === rawTag) ? rawTag! : "all";

  const cardNews = await getCardNews(activeTag);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-14">

        {/* 카드뉴스 섹션 */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-text-dark">카드뉴스</h2>
              <span className="text-sm text-text-gray">{cardNews.length}건</span>
            </div>
            {/* 필터 탭 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_TABS.map((tab) => {
                const isActive = activeTag === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={tab.value === "all" ? "/news" : `/news?tag=${tab.value}`}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-green-primary text-white"
                        : "bg-white border border-gray-200 text-text-gray hover:border-brand-green-primary hover:text-brand-green-primary"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {cardNews.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-text-gray">
              해당 지역 카드뉴스가 없습니다.
            </div>
          ) : (
            <div className="relative">
              {/* 그라디언트 페이드 — 모바일 가로 스크롤 시에만 */}
              <div className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-50 to-transparent z-10" />
              <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 to-transparent z-10" />

              {/* 모바일: 가로 스크롤 / 데스크탑: 그리드 */}
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-px-4 md:overflow-visible md:mx-0 md:px-0">
                <div className="flex flex-nowrap gap-3 sm:gap-4 pb-2 w-max md:w-auto md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:pb-0">
                  {cardNews.map((item) => {
                    const href = item.link?.trim() || `/news/${item.id}`;
                    const isExternal = href.startsWith("http");
                    const tags = [
                      item.category ? `#${item.category}` : null,
                      item.hashtags.find((t) =>
                        ["#서울","#인천","#포천","#가평","#충남","#일본","#해외","#국내"].includes(t)
                      ) ?? null,
                    ].filter(Boolean) as string[];

                    return (
                      <Link
                        key={item.id}
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="group flex-shrink-0 w-[56vw] sm:w-56 md:w-auto"
                      >
                        {/* 태그 — 이미지 위, 겹침 없음 */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-brand-green-primary/10 text-brand-green-primary px-2.5 py-0.5 text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-50">
                          <Image
                            src={item.imageUrl!}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 56vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-contain group-hover:scale-[1.03] transition-transform duration-300"
                          />
                          {isRecentlyAdded(item.createdAt) && (
                            <span className="absolute top-2 left-2 rounded-full bg-brand-green-primary px-2.5 py-0.5 text-[10px] font-bold text-white">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="mt-2 px-0.5">
                          <p className="text-text-dark text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
                            {stripBrandFromTitle(item.title)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 문의 CTA */}
        <div className="rounded-2xl bg-brand-green-primary px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg leading-snug">프로그램이 궁금하신가요?</p>
            <p className="text-white/80 text-sm mt-0.5">빠른 문의로 맞춤 견적을 받아보세요.</p>
          </div>
          <Link
            href="/inquiry?type=quick"
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white text-brand-green-primary font-semibold px-5 py-2.5 text-sm hover:bg-white/90 transition-colors"
          >
            빠른 문의하기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

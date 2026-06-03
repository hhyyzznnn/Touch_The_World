import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import { CompanyNewsType } from "@prisma/client";
import Image from "next/image";

export const metadata: Metadata = {
  title: "회사 소식 - Touch The World",
  description: "터치더월드의 새로운 소식과 중요한 공지입니다.",
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

function stripBrandFromTitle(title: string): string {
  return title
    .replace(/^\[?터치더월드\]?\s*[×x\-·|]\s*/i, "")
    .replace(/\s*[×x\-·|]\s*터치더월드\s*$/i, "")
    .trim();
}

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
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, imageUrl: true, link: true, category: true, hashtags: true, isPinned: true },
  });
}

async function getNews() {
  return await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.COMPANY_NEWS },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag: rawTag } = await searchParams;
  const activeTag = FILTER_TABS.some((t) => t.value === rawTag) ? rawTag! : "all";

  const [cardNews, list] = await Promise.all([getCardNews(activeTag), getNews()]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-14">

        {/* 카드뉴스 섹션 */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-dark">카드뉴스</h2>
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
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-gray-50 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 to-transparent z-10" />
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-px-4 [touch-action:pan-x] overscroll-x-contain">
                <div className="flex gap-3 sm:gap-4 pb-2 w-max">
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
                        className="group flex-shrink-0 w-[56vw] sm:w-64 md:w-72"
                      >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-50">
                          <Image
                            src={item.imageUrl!}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 56vw, 288px"
                            className="object-contain group-hover:scale-[1.03] transition-transform duration-300"
                          />
                          {item.isPinned && (
                            <span className="absolute top-2 left-2 rounded-full bg-brand-green-primary px-2.5 py-0.5 text-[10px] font-bold text-white">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="mt-2 px-0.5 space-y-1.5">
                          <p className="text-text-dark text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
                            {stripBrandFromTitle(item.title)}
                          </p>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-brand-green-primary/10 text-brand-green-primary px-2.5 py-0.5 text-xs font-medium">
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
            </div>
          )}
        </section>

        {/* 회사 소식 테이블 */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-text-dark mb-4">회사 소식</h2>
          {list.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-text-gray">
              등록된 소식이 없습니다.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-20 sm:w-24">
                        분류
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        제목
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-24 sm:w-28">
                        작성일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {list.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {item.isPinned && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-brand-green-primary text-white">
                              공지
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/news/${item.id}`}
                            className="text-text-dark hover:text-brand-green-primary hover:underline underline-offset-2"
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-gray whitespace-nowrap">
                          {format(new Date(item.createdAt), "yyyy.MM.dd")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

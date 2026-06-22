import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { Pagination } from "@/components/Pagination";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { seoLandingPageList } from "@/lib/seo-landing-pages";
import { CompanyNewsType } from "@prisma/client";
import { PROGRAM_CATEGORIES } from "@/lib/admin-news-request";
import { isRecentlyAdded, stripBrandFromTitle } from "@/lib/news-utils";

// category/page 파라미터가 있는 URL에서도 canonical이 /programs로 반드시 포함되도록 generateMetadata 사용
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "프로그램 카드뉴스 | 터치더월드",
    description:
      "터치더월드의 프로그램 가치와 인사이트를 카드뉴스 형태로 확인하세요. 세부 일정과 견적은 상담 후 맞춤 제안합니다.",
    keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS, ["카드뉴스", "프로그램 인사이트"]),
    alternates: {
      canonical: "/programs",
    },
  };
}

const ITEMS_PER_PAGE = 12;

async function getProgramCardNews(page: number, category?: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where = {
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    ...(category ? { category } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.companyNews.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        imageUrl: true,
        hashtags: true,
        createdAt: true,
        isPinned: true,
        link: true,
      },
    }),
    prisma.companyNews.count({ where }),
  ]);

  return {
    items,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
  };
}

export const dynamic = "force-dynamic";

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const currentCategory = params.category || "";
  const { items, totalPages } = await getProgramCardNews(currentPage, currentCategory || undefined);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">프로그램 카드뉴스</h1>
        <p className="text-sm sm:text-base text-text-gray leading-relaxed max-w-3xl">
          가격표보다 교육 목표와 운영 철학을 먼저 확인하세요.
          구체적인 일정·견적은 상담 후 기관별 맞춤형으로 안내드립니다.
        </p>

        {/* 카테고리 필터 */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          <Link
            href="/programs"
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              !currentCategory
                ? "bg-brand-green-primary text-white"
                : "bg-gray-100 text-text-gray hover:bg-gray-200"
            }`}
          >
            전체
          </Link>
          {PROGRAM_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/programs?category=${encodeURIComponent(cat)}`}
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                currentCategory === cat
                  ? "bg-brand-green-primary text-white"
                  : "bg-gray-100 text-text-gray hover:bg-gray-200"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* SEO 랜딩 페이지 링크 */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-xs text-gray-400">관련</span>
          {seoLandingPageList.map((page) => (
            <Link
              key={page.path}
              href={page.path}
              className="text-xs text-gray-400 hover:text-brand-green-primary transition-colors"
            >
              {page.title}
            </Link>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-text-gray rounded-xl border border-dashed border-gray-300 bg-gray-50">
          {currentCategory
            ? `'${currentCategory}' 카테고리에 등록된 카드뉴스가 없습니다.`
            : "등록된 카드뉴스가 없습니다."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((item) => {
              const href = item.link?.trim() || `/news/${item.id}`;
              const isExternal = !!item.link?.trim()?.startsWith("http");
              const isNew = isRecentlyAdded(item.createdAt);
              const categoryTag = item.category ?? null;
              const regionTag = item.hashtags.find((t) =>
                ["#서울", "#인천", "#포천", "#가평", "#충남", "#일본", "#해외", "#국내"].includes(t)
              ) ?? null;
              const showTagRow = isNew || categoryTag || regionTag;

              return (
                <Link
                  key={item.id}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                >
                  {/* 태그 행 — NEW + 카테고리(초록) + 지역(회색) */}
                  {showTagRow && (
                    <div className="px-3 pt-2.5 pb-0 flex flex-wrap items-center gap-1">
                      {isNew && (
                        <span className="rounded bg-brand-green-primary text-white px-2.5 py-0.5 text-xs font-bold">
                          NEW
                        </span>
                      )}
                      {categoryTag && (
                        <span className="rounded-full bg-brand-green-primary/10 text-brand-green-primary px-2.5 py-0.5 text-xs font-medium">
                          #{categoryTag}
                        </span>
                      )}
                      {regionTag && (
                        <span className="rounded-full bg-gray-100 text-text-gray px-2.5 py-0.5 text-xs">
                          {regionTag}
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`relative aspect-[3/4] bg-gray-50 ${showTagRow ? "mt-2" : ""}`}>
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-contain group-hover:scale-[1.03] transition-transform duration-200"
                      />
                    ) : null}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-sm sm:text-base font-medium text-text-dark line-clamp-2">{stripBrandFromTitle(item.title)}</p>
                    {item.summary && (
                      <p className="mt-1 text-xs sm:text-sm text-text-gray line-clamp-2">{item.summary}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/programs"
            searchParams={{ ...params, page: undefined }}
          />
        </>
      )}
    </div>
  );
}

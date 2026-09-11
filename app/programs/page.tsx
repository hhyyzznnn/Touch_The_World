import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { Pagination } from "@/components/Pagination";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { CompanyNewsType } from "@prisma/client";
import { PROGRAM_CATEGORIES } from "@/lib/admin-news-request";
import { CATEGORY_COLORS } from "@/lib/news-constants";
import { isRecentlyAdded, stripBrandFromTitle } from "@/lib/news-utils";
import { unstable_cache } from "next/cache";

// category/page 등 쿼리 파라미터가 있는 URL은 /programs와 중복 색인되지 않도록 noindex 처리
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasQueryParams = Object.keys(params).length > 0;

  return {
    title: "프로그램 카드뉴스 | 터치더월드",
    description:
      "터치더월드의 프로그램 가치와 인사이트를 카드뉴스 형태로 확인하세요. 세부 일정과 견적은 상담 후 맞춤 제안합니다.",
    keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS, ["카드뉴스", "프로그램 인사이트"]),
    alternates: {
      canonical: "/programs",
    },
    ...(hasQueryParams ? { robots: { index: false, follow: true } } : {}),
  };
}

const ITEMS_PER_PAGE = 12;
// "전체" 탭에서 카테고리별 한 줄에 미리보기로 보여줄 최대 개수 — 그 이상은 "전체 보기"로 유도
const GROUP_PREVIEW_LIMIT = 4;

const CARD_SELECT = {
  id: true,
  title: true,
  summary: true,
  categories: true,
  imageUrl: true,
  hashtags: true,
  createdAt: true,
  isPinned: true,
  link: true,
} as const;

type CardNewsItem = {
  id: string;
  title: string;
  summary: string | null;
  categories: string[];
  imageUrl: string | null;
  hashtags: string[];
  createdAt: Date;
  isPinned: boolean;
  link: string | null;
};

async function getProgramCardNews(page: number, category?: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where = {
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    ...(category ? { categories: { has: category } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.companyNews.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: ITEMS_PER_PAGE,
      select: CARD_SELECT,
    }),
    prisma.companyNews.count({ where }),
  ]);

  return {
    items,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
  };
}

const getProgramCardNewsCached = unstable_cache(
  getProgramCardNews,
  ["programs-card-news"],
  { revalidate: 600 },
);

// "전체" 탭 전용: 카테고리 8개 순서대로 한 줄씩 묶어서 보여주기 위한 그룹핑.
// 카드 한 건이 여러 카테고리에 걸칠 수 있어(예: 특성화고 프로그램 + 국외 교육여행),
// 같은 카드가 해당하는 모든 줄에 각각 노출될 수 있다 — 의도된 동작.
async function getProgramCardNewsGrouped() {
  const items = await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.PROGRAM_CARD_NEWS },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: CARD_SELECT,
  });

  return PROGRAM_CATEGORIES.map((cat) => {
    const matched = items.filter((item) => item.categories.includes(cat));
    return {
      category: cat,
      items: matched.slice(0, GROUP_PREVIEW_LIMIT),
      total: matched.length,
    };
  }).filter((group) => group.items.length > 0);
}

const getProgramCardNewsGroupedCached = unstable_cache(
  getProgramCardNewsGrouped,
  ["programs-card-news-grouped"],
  { revalidate: 600 },
);

const REGION_TAGS = ["#서울", "#인천", "#포천", "#가평", "#충남", "#일본", "#해외", "#국내"];

function ProgramCard({ item, className = "" }: { item: CardNewsItem; className?: string }) {
  const href = item.link?.trim() || `/news/${item.id}`;
  const isExternal = !!item.link?.trim()?.startsWith("http");
  const isNew = isRecentlyAdded(item.createdAt);
  const regionTag = item.hashtags.find((t) => REGION_TAGS.includes(t)) ?? null;
  const showTagRow = isNew || item.categories.length > 0 || regionTag;

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow ${className}`}
    >
      {/* 태그 행 — NEW + 카테고리(초록) + 지역(회색) */}
      {showTagRow && (
        <div className="px-3 pt-2.5 pb-0 flex flex-wrap items-center gap-1">
          {isNew && (
            <span className="rounded bg-brand-green-primary text-white px-2.5 py-0.5 text-xs font-bold">
              NEW
            </span>
          )}
          {item.categories.map((cat) => (
            <span
              key={cat}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ??
                "bg-[#64748B] text-white"
              }`}
            >
              #{cat}
            </span>
          ))}
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
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const currentCategory = params.category || "";

  const flat = currentCategory
    ? await getProgramCardNewsCached(currentPage, currentCategory)
    : null;
  const groupedSections = currentCategory
    ? null
    : await getProgramCardNewsGroupedCached();

  const isEmpty = currentCategory ? flat!.items.length === 0 : groupedSections!.length === 0;

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
                ? "bg-gray-900 text-white shadow-sm"
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
                  ? "bg-gray-900 text-white shadow-sm"
                  : `${CATEGORY_COLORS[cat]} hover:brightness-110`
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-16 text-text-gray rounded-xl border border-dashed border-gray-300 bg-gray-50">
          {currentCategory
            ? `'${currentCategory}' 카테고리에 등록된 카드뉴스가 없습니다.`
            : "등록된 카드뉴스가 없습니다."}
        </div>
      ) : currentCategory ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {flat!.items.map((item) => (
              <ProgramCard key={item.id} item={item} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={flat!.totalPages}
            baseUrl="/programs"
            searchParams={{ ...params, page: undefined }}
          />
        </>
      ) : (
        <div className="space-y-10">
          {groupedSections!.map((section) => (
            <section key={section.category}>
              <div className="flex items-center justify-between mb-3">
                <h2
                  className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold ${CATEGORY_COLORS[section.category]}`}
                >
                  {section.category}
                </h2>
                {section.total > section.items.length && (
                  <Link
                    href={`/programs?category=${encodeURIComponent(section.category)}`}
                    className="text-sm text-brand-green-primary hover:underline flex-shrink-0"
                  >
                    전체 {section.total}개 보기
                  </Link>
                )}
              </div>

              {/* 모바일: 가로 스크롤 / 데스크탑: 그리드 */}
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-px-4 md:overflow-visible md:mx-0 md:px-0">
                <div className="flex flex-nowrap gap-3 sm:gap-4 pb-2 w-max md:w-auto md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0">
                  {section.items.map((item) => (
                    <ProgramCard
                      key={item.id}
                      item={item}
                      className="w-[42vw] sm:w-52 md:w-auto flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

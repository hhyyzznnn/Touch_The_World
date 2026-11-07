import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { Pagination } from "@/components/Pagination";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { CompanyNewsType } from "@prisma/client";
import { PROGRAM_CATEGORIES } from "@/lib/news-constants";
import { CATEGORY_CARDS } from "@/lib/category-cards";
import { isEnded, isRecentlyAdded, stripBrandFromTitle } from "@/lib/news-utils";
import { unstable_cache } from "next/cache";
import { AUDIENCES, audienceLabel, getAudiences, isAudienceKey, type AudienceKey } from "@/lib/news-audience";

const KEYWORDS = mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS, ["카드뉴스", "프로그램 인사이트"]);

// 카테고리별 목록(?category=, ?category=&page=)은 각자 주소로 색인되게 한다. "전체" 탭은 분야 타일과 인기·최근 글만
// 보여주므로, 이 목록이 색인에서 빠지면 검색엔진이 나머지 카드뉴스로 갈 길이 사이트맵뿐이다.
// 그 밖의 쿼리 파라미터가 붙은 URL만 /programs와 중복되지 않도록 noindex 처리한다.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : "";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const isCategoryList =
    (PROGRAM_CATEGORIES as readonly string[]).includes(category) &&
    Object.keys(params).every((key) => key === "category" || key === "page") &&
    Number.isInteger(page) &&
    page >= 1;

  if (isCategoryList) {
    const pageSuffix = page > 1 ? ` (${page}페이지)` : "";
    return {
      title: `${category} 프로그램 카드뉴스${pageSuffix} | 터치더월드`,
      description: `터치더월드가 기획·운영한 ${category} 프로그램을 카드뉴스로 모았습니다${pageSuffix}. 세부 일정과 견적은 상담 후 맞춤 제안합니다.`,
      keywords: mergeKeywords(KEYWORDS, [category]),
      alternates: {
        canonical: `/programs?category=${encodeURIComponent(category)}${page > 1 ? `&page=${page}` : ""}`,
      },
    };
  }

  const hasQueryParams = Object.keys(params).length > 0;

  return {
    title: "프로그램 카드뉴스 | 터치더월드",
    description:
      "터치더월드의 프로그램 가치와 인사이트를 카드뉴스 형태로 확인하세요. 세부 일정과 견적은 상담 후 맞춤 제안합니다.",
    keywords: KEYWORDS,
    alternates: {
      canonical: "/programs",
    },
    ...(hasQueryParams ? { robots: { index: false, follow: true } } : {}),
  };
}

const ITEMS_PER_PAGE = 12;

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
  endDate: true,
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
  endDate: Date | null;
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

// "전체" 탭 전용: 분야별 글 수(분야 타일)와 최근 글 8건.
// 카드 한 건이 여러 분야에 걸칠 수 있어(예: 특성화고 프로그램 + 일본 교육여행) 분야별 수의 합은 전체보다 클 수 있다.
const LATEST_LIMIT = 8;

async function getProgramsOverview() {
  const items = await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.PROGRAM_CARD_NEWS },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: CARD_SELECT,
  });
  const counts = Object.fromEntries(
    PROGRAM_CATEGORIES.map((cat) => [cat, items.filter((item) => item.categories.includes(cat)).length]),
  ) as Record<(typeof PROGRAM_CATEGORIES)[number], number>;
  const latest = [...items]
    .sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime())
    .slice(0, LATEST_LIMIT);
  return { total: items.length, counts, latest };
}

const getProgramsOverviewCached = unstable_cache(
  getProgramsOverview,
  ["programs-overview"],
  { revalidate: 600 },
);

// 인기 프로그램 (2026-10-28 취합): 7~10월 홈페이지 실사용자(GA4, 봇 영향이 큰 직접 유입 제외) +
// 유튜브 쇼츠 조회수 + 문의 언급을 합산한 순위에서, 종료된 글을 빼고 분야가 겹치지 않게 6개를 골랐다.
// 월 1회 주간 점검 때 다시 취합해 바꾼다.
const POPULAR_PROGRAM_IDS = [
  "cardnews_seoul_gyeonggi_teacher_training_accommodations_2026", // 서울·경기 교직원 연수 숙소 7선 (1위)
  "cardnews_specialized_highschool_global_field_study_2026", // 특성화고 후쿠오카 글로벌 현장학습
  "cardnews_aso_japanese_language_course_2026", // 아소전문학교그룹 일본어과
  "cardnews_inspire_resort_teacher_training_2026", // 인스파이어 리조트 교직원 연수
  "cardnews_fukuoka_junghwa_girls_exchange_2026", // 후쿠오카 국제대면교류 (정화여중)
  "cardnews_japan_edu_trip_2026", // 일본 에듀트립 교육여행 제안서
];

async function getPopularPrograms() {
  const items = await prisma.companyNews.findMany({
    where: { id: { in: POPULAR_PROGRAM_IDS }, type: CompanyNewsType.PROGRAM_CARD_NEWS },
    select: CARD_SELECT,
  });
  // DB 조회 순서가 아니라 클릭 순위 그대로 정렬
  return POPULAR_PROGRAM_IDS.map((id) => items.find((item) => item.id === id)).filter(
    (item): item is CardNewsItem => !!item
  );
}

const getPopularProgramsCached = unstable_cache(
  getPopularPrograms,
  ["programs-popular"],
  { revalidate: 600 },
);

// "누구와 가시나요"(?audience=) 전용: 전체 글에 대상 학교급을 붙여 둔다.
// 해시태그 + 본문의 "초·중·고" 같은 표현으로 판정(lib/news-audience.ts). 본문은 판정에만 쓰고 넘기지 않는다.
async function getAudienceIndex() {
  const items = await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.PROGRAM_CARD_NEWS },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: { ...CARD_SELECT, content: true },
  });
  return items.map(({ content, ...item }) => ({ ...item, audiences: getAudiences({ ...item, content }) }));
}

const getAudienceIndexCached = unstable_cache(getAudienceIndex, ["programs-audience-index"], { revalidate: 600 });

function AudiencePicker({
  current,
  category,
  counts,
  className = "",
}: {
  current: AudienceKey | null;
  category: string;
  counts: Record<AudienceKey, number>;
  className?: string;
}) {
  const href = (audience: AudienceKey | null) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (audience) q.set("audience", audience);
    const qs = q.toString();
    return qs ? `/programs?${qs}` : "/programs";
  };
  const chip = (active: boolean) =>
    `inline-flex h-11 flex-shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors ${
      active
        ? "border-brand-green-primary bg-brand-green-primary font-bold text-white"
        : "border-gray-300 bg-white font-medium text-text-dark hover:border-brand-green-primary"
    }`;
  return (
    <div className={className}>
      <p id="audience-label" className="mb-2.5 text-sm sm:text-base font-bold text-text-dark">누구와 가시나요?</p>
      <nav aria-labelledby="audience-label" className="-mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide sm:flex-wrap sm:overflow-visible">
        <Link href={href(null)} aria-current={!current ? "page" : undefined} className={chip(!current)}>
          전체
        </Link>
        {AUDIENCES.map(({ key, label }) => (
          <Link key={key} href={href(key)} aria-current={current === key ? "page" : undefined} className={chip(current === key)}>
            {label}
            <span className={current === key ? "text-white/80" : "text-text-gray"}>{counts[key]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

const REGION_TAGS = ["#서울", "#인천", "#포천", "#가평", "#충남", "#일본", "#해외", "#국내"];

// 카드뉴스 표지는 4:5(1080×1350) — 같은 비율 칸에 꽉 채우고, 분야·지역은 사진 아래 한 줄 글자로
function ProgramCard({
  item,
  className = "",
  priority = false,
  rank,
}: {
  item: CardNewsItem;
  className?: string;
  priority?: boolean;
  rank?: number;
}) {
  const href = item.link?.trim() || `/news/${item.id}`;
  const isExternal = !!item.link?.trim()?.startsWith("http");
  const ended = isEnded(item.endDate);
  const isNew = !ended && isRecentlyAdded(item.createdAt);
  const region = item.hashtags.find((t) => REGION_TAGS.includes(t))?.slice(1) ?? null;
  const meta = [item.categories[0], region].filter(Boolean).join(" · ");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`group flex flex-col gap-2.5 ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={`${stripBrandFromTitle(item.title)} 카드뉴스 표지`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute left-2 top-2 flex gap-1">
          {rank && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B4332] text-sm font-bold text-white">
              {rank}
            </span>
          )}
          {ended && <span className="rounded-full bg-gray-600 px-2.5 py-1 text-xs font-bold text-white">종료</span>}
          {isNew && <span className="rounded-full bg-brand-green-primary px-2.5 py-1 text-xs font-bold text-white">NEW</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {meta && <span className="text-xs sm:text-[13px] font-bold text-brand-green-primary">{meta}</span>}
        <span className="text-sm sm:text-base font-bold leading-snug text-text-dark line-clamp-2 break-keep group-hover:underline">
          {stripBrandFromTitle(item.title)}
        </span>
      </div>
    </Link>
  );
}

function SearchBox({ className = "" }: { className?: string }) {
  return (
    <form action="/search" role="search" className={className}>
      <label className="flex h-12 items-center gap-2.5 rounded-xl border border-gray-300 bg-white px-4 focus-within:border-brand-green-primary focus-within:ring-2 focus-within:ring-brand-green-primary/20">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <span className="sr-only">프로그램 검색</span>
        <input
          type="search"
          name="q"
          placeholder="지역·학년·프로그램 이름 (예: 후쿠오카, 초등)"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-text-dark outline-none placeholder:text-gray-500"
        />
      </label>
    </form>
  );
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; audience?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const currentCategory = params.category || "";
  const currentAudience = isAudienceKey(params.audience) ? params.audience : null;

  // 대상 고르기 칸의 글 수는 지금 보고 있는 분야 안에서 센다
  const audienceIndex = await getAudienceIndexCached();
  const inCategory = currentCategory ? audienceIndex.filter((item) => item.categories.includes(currentCategory)) : audienceIndex;
  const audienceCounts = Object.fromEntries(
    AUDIENCES.map(({ key }) => [key, inCategory.filter((item) => item.audiences.includes(key)).length]),
  ) as Record<AudienceKey, number>;

  let flat: { items: CardNewsItem[]; totalPages: number } | null = null;
  if (currentAudience) {
    const matched = inCategory.filter((item) => item.audiences.includes(currentAudience));
    flat = {
      items: matched.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
      totalPages: Math.max(1, Math.ceil(matched.length / ITEMS_PER_PAGE)),
    };
  } else if (currentCategory) {
    flat = await getProgramCardNewsCached(currentPage, currentCategory);
  }
  const overview = flat ? null : await getProgramsOverviewCached();
  const popularPrograms = flat ? null : await getPopularProgramsCached();

  // ── 분야별·대상별 목록 ──
  if (flat) {
    const heading = [currentCategory, currentAudience && audienceLabel(currentAudience)].filter(Boolean).join(" · ");
    const emptyText = currentAudience
      ? `${heading}에 맞는 프로그램이 아직 없습니다. 학년·인원을 알려 주시면 맞춤 일정을 짜 드립니다.`
      : `'${currentCategory}' 분야에 등록된 프로그램이 없습니다.`;
    const categoryHref = (cat: string) => {
      const q = new URLSearchParams();
      if (cat) q.set("category", cat);
      if (currentAudience) q.set("audience", currentAudience);
      const qs = q.toString();
      return qs ? `/programs?${qs}` : "/programs";
    };
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-keep">{heading}</h1>
          <p className="text-sm sm:text-base text-text-gray leading-relaxed max-w-3xl break-keep">
            구체적인 일정·견적은 상담 후 학교별 맞춤형으로 안내드립니다.
          </p>
          <AudiencePicker current={currentAudience} category={currentCategory} counts={audienceCounts} className="mt-6" />
          <p id="category-label" className="mt-5 mb-2.5 text-sm sm:text-base font-bold text-text-dark">분야</p>
          <nav aria-labelledby="category-label" className="-mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide sm:flex-wrap sm:overflow-visible">
            <Link
              href={categoryHref("")}
              aria-current={!currentCategory ? "page" : undefined}
              className={`inline-flex h-10 flex-shrink-0 items-center rounded-full border px-4 text-sm transition-colors ${
                !currentCategory
                  ? "border-brand-green-primary bg-brand-green-primary font-bold text-white"
                  : "border-gray-300 bg-white font-medium text-text-dark hover:border-brand-green-primary"
              }`}
            >
              전체
            </Link>
            {PROGRAM_CATEGORIES.map((cat) => {
              const active = currentCategory === cat;
              return (
                <Link
                  key={cat}
                  href={categoryHref(cat)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-10 flex-shrink-0 items-center rounded-full border px-4 text-sm transition-colors ${
                    active
                      ? "border-brand-green-primary bg-brand-green-primary font-bold text-white"
                      : "border-gray-300 bg-white font-medium text-text-dark hover:border-brand-green-primary"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>
        </div>

        {flat!.items.length === 0 ? (
          <div className="text-center py-16 text-text-gray rounded-xl border border-dashed border-gray-300 bg-gray-50">
            <p className="break-keep px-4">{emptyText}</p>
            <Link href="/inquiry" className="mt-4 inline-flex h-11 items-center rounded-lg bg-brand-green-primary px-5 text-sm font-bold text-white hover:bg-[#1B4332]">
              맞춤 일정 상담하기
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8">
              {/* 첫 화면에 보이는 카드는 지연 로딩하지 않는다 (모바일 첫 화면 표시가 늦어지던 원인) */}
              {flat!.items.map((item, i) => (
                <ProgramCard key={item.id} item={item} priority={i < 2} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={flat!.totalPages}
              baseUrl="/programs"
              searchParams={{ ...params, page: undefined }}
            />
          </>
        )}
      </div>
    );
  }

  // ── 전체: 분야 허브 ──
  const { total, counts, latest } = overview!;
  return (
    <div>
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-10 sm:py-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">프로그램</h1>
            <p className="text-sm sm:text-base text-text-gray leading-relaxed break-keep">
              {PROGRAM_CATEGORIES.length}개 분야, {total}개 프로그램을 운영하고 있습니다. 분야를 고르시거나 바로 검색해 보세요.
            </p>
          </div>
          <SearchBox className="hidden sm:block w-full lg:w-[420px]" />
        </div>
        <div className="container mx-auto px-4 pb-8 sm:pb-10 -mt-1">
          <AudiencePicker current={null} category="" counts={audienceCounts} />
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 sm:py-14 space-y-12 sm:space-y-16">
        <section aria-labelledby="by-category">
          <h2 id="by-category" className="text-lg sm:text-2xl font-bold mb-4 sm:mb-5">분야별로 보기</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {CATEGORY_CARDS.map((card, i) => (
              <Link
                key={card.name}
                href={`/programs?category=${encodeURIComponent(card.name)}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    priority={i < 4}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-col gap-1 p-3 sm:p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm sm:text-[17px] font-bold text-text-dark break-keep">{card.name}</span>
                    <span className="flex-shrink-0 text-xs sm:text-sm font-bold text-brand-green-primary">{counts[card.name]}개</span>
                  </div>
                  <span className="hidden sm:block text-sm leading-relaxed text-text-gray break-keep line-clamp-2">
                    {card.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {popularPrograms!.length > 0 && (
          <section aria-labelledby="popular">
            <h2 id="popular" className="text-lg sm:text-2xl font-bold mb-4 sm:mb-5">선생님들이 많이 찾는 프로그램</h2>
            <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide lg:mx-0 lg:px-0 lg:overflow-visible">
              <div className="flex gap-3 sm:gap-4 pb-1 w-max lg:w-auto lg:grid lg:grid-cols-6">
                {popularPrograms!.map((item, i) => (
                  <ProgramCard key={item.id} item={item} rank={i + 1} className="w-[38vw] sm:w-44 lg:w-auto flex-shrink-0" />
                ))}
              </div>
            </div>
          </section>
        )}

        {latest.length > 0 && (
          <section aria-labelledby="latest">
            <h2 id="latest" className="text-lg sm:text-2xl font-bold mb-4 sm:mb-5">새로 올라온 프로그램</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8">
              {latest.map((item) => (
                <ProgramCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-[#1B4332] px-6 py-7 sm:px-8 sm:py-8 text-white flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg sm:text-xl font-bold break-keep">찾으시는 일정이 없으신가요?</p>
            <p className="mt-1 text-sm sm:text-[15px] text-[#D1E7DA] break-keep">
              학년·인원·예산을 알려 주시면 학교에 맞춰 일정을 새로 짜 드립니다.
            </p>
          </div>
          <Link
            href="/inquiry"
            className="inline-flex h-12 flex-shrink-0 items-center justify-center rounded-lg bg-white px-6 text-[15px] font-bold text-[#1B4332] hover:bg-gray-100"
          >
            맞춤 일정 상담하기
          </Link>
        </section>
      </div>
    </div>
  );
}

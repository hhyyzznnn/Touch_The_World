import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProgramCard } from "@/components/programs/ProgramCard";
import Link from "next/link";
import Image from "next/image";
import { getEventThumbnailUrl, getEventThumbnailPosition } from "@/lib/event-utils";
import { format } from "date-fns";
import type { Metadata } from "next";
import { AdvancedSearchFilters } from "@/components/AdvancedSearchFilters";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import type { ProgramWhereInput, EventWhereInput, SchoolWhereInput, AchievementWhereInput } from "@/types";
import { parsePositivePageParam } from "@/lib/search-params";
import { isEnded, stripBrandFromTitle } from "@/lib/news-utils";
import { PROGRAM_CATEGORIES as NEWS_CATEGORIES } from "@/lib/news-constants";
import type { Prisma } from "@prisma/client";

interface SearchFilters {
  category?: string;
  region?: string;
  priceMin?: string;
  priceMax?: string;
  hashtag?: string;
}

const ITEMS_PER_TYPE = 12; // 타입별 표시할 항목 수

export const metadata: Metadata = {
  title: "검색 | 터치더월드",
  robots: {
    index: false,
    follow: true,
  },
};

// 페이지 재검증 시간 설정 (5분 - 검색 결과는 자주 변경될 수 있음)
export const revalidate = 300;

/**
 * 홈페이지 게시물(카드뉴스·회사 소식) 검색.
 * 방문자가 프로그램 메뉴에서 실제로 보는 콘텐츠는 이 게시물들이라, 검색에서 빠지면
 * "포천", "하나투어"처럼 게시물에만 있는 내용은 결과가 0건으로 나온다.
 */
async function searchPosts(query: string, filters: SearchFilters, page: number) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const hasFilters = Boolean(filters.category || filters.region || filters.hashtag);
  // 게시물에는 가격 정보가 없으므로 가격 조건이 걸리면 결과에서 제외한다.
  if ((tokens.length === 0 && !hasFilters) || filters.priceMin || filters.priceMax) {
    return { posts: [], totalPosts: 0 };
  }

  const contains = (value: string) => ({ contains: value, mode: "insensitive" as const });
  const and: Prisma.CompanyNewsWhereInput[] = tokens.map((token) => ({
    // "인천 체험학습"처럼 여러 단어를 넣으면 단어마다 어딘가에는 들어 있어야 한다.
    OR: [
      { title: contains(token) },
      { summary: contains(token) },
      { content: contains(token) },
      { hashtags: { hasSome: [token, `#${token}`] } },
      { categories: { has: token } },
    ],
  }));

  if (filters.category) {
    // 필터는 "국내교육여행"처럼 공백 없는 키를 쓰고, 게시물은 "국내 교육여행"으로 저장돼 있다.
    const compact = (value: string) => value.replace(/\s+/g, "").replace("고교", "고");
    const matched = NEWS_CATEGORIES.filter((cat) => compact(cat) === compact(filters.category!));
    and.push({ categories: { hasSome: matched.length > 0 ? [...matched] : [filters.category] } });
  }
  if (filters.region) {
    and.push({
      OR: [
        { hashtags: { hasSome: [filters.region, `#${filters.region}`] } },
        { title: contains(filters.region) },
        { summary: contains(filters.region) },
      ],
    });
  }
  if (filters.hashtag) {
    const tag = filters.hashtag.replace(/^#/, "");
    and.push({ hashtags: { hasSome: [tag, `#${tag}`] } });
  }

  const matches = await prisma.companyNews.findMany({
    where: { AND: and },
    select: { id: true, title: true, summary: true, imageUrl: true, categories: true, hashtags: true, link: true, endDate: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  // 본문 어딘가에 단어가 스친 글보다 제목·태그에 검색어가 있는 글이 먼저 나오도록 정렬한다.
  // (게시물이 수백 건 규모라 전부 가져와 메모리에서 정렬·페이지 분할해도 부담이 없다.)
  const relevance = (post: (typeof matches)[number]) =>
    tokens.reduce((score, token) => {
      const t = token.toLowerCase();
      if (post.title.toLowerCase().includes(t)) return score + 3;
      if ([...post.hashtags, ...post.categories].some((tag) => tag.toLowerCase().includes(t))) return score + 2;
      if (post.summary?.toLowerCase().includes(t)) return score + 1;
      return score;
    }, 0);
  const ranked = matches
    .map((post, index) => ({ post, index, score: relevance(post) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.post)
    // 같은 글이 회사 소식과 카드뉴스 양쪽에 등록된 경우 한 번만 보여준다.
    .filter((post, index, all) => all.findIndex((other) => other.title === post.title) === index);

  const start = (page - 1) * ITEMS_PER_TYPE;
  return { posts: ranked.slice(start, start + ITEMS_PER_TYPE), totalPosts: ranked.length };
}

async function searchAll(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  type: "programs" | "events" | "schools" | "achievements" = "programs"
) {
  const searchQuery = query.trim();
  
  // 필터만 있고 검색어가 없는 경우도 허용
  const hasQuery = searchQuery.length > 0;
  const hasFilters = Boolean(filters.category || filters.region || filters.priceMin || filters.priceMax || filters.hashtag);

  if (!hasQuery && !hasFilters) {
    return {
      programs: [],
      events: [],
      schools: [],
      achievements: [],
      totalPrograms: 0,
      totalEvents: 0,
      totalSchools: 0,
      totalAchievements: 0,
    };
  }

  const skip = (page - 1) * ITEMS_PER_TYPE;

  // 타입별로 필요한 데이터만 조회
  if (type === "programs") {
    const programWhere: ProgramWhereInput = {};
    
    if (hasQuery) {
      programWhere.OR = [
        { title: { contains: searchQuery, mode: "insensitive" as const } },
        { summary: { contains: searchQuery, mode: "insensitive" as const } },
        { description: { contains: searchQuery, mode: "insensitive" as const } },
        { region: { contains: searchQuery, mode: "insensitive" as const } },
        { hashtags: { hasSome: [searchQuery] } },
      ];
    }

    if (filters.category) {
      programWhere.category = filters.category;
    }
    
    if (filters.region) {
      programWhere.region = { contains: filters.region, mode: "insensitive" as const };
    }
    
    if (filters.priceMin || filters.priceMax) {
      const andConditions: Array<{ priceFrom?: { gte: number }; priceTo?: { lte: number } }> = [];
      if (filters.priceMin) {
        andConditions.push({ priceFrom: { gte: parseInt(filters.priceMin) } });
      }
      if (filters.priceMax) {
        andConditions.push({ priceTo: { lte: parseInt(filters.priceMax) } });
      }
      if (andConditions.length > 0) {
        programWhere.AND = andConditions;
      }
    }
    
    if (filters.hashtag) {
      programWhere.hashtags = { hasSome: [filters.hashtag] };
    }

    const [programs, totalPrograms] = await Promise.all([
      prisma.program.findMany({
        where: programWhere,
        include: {
          images: {
            take: 1,
            orderBy: { createdAt: "asc" },
          },
        },
        skip,
        take: ITEMS_PER_TYPE,
        orderBy: { createdAt: "desc" },
      }),
      prisma.program.count({ where: programWhere }),
    ]);

    return {
      programs,
      events: [],
      schools: [],
      achievements: [],
      totalPrograms,
      totalEvents: 0,
      totalSchools: 0,
      totalAchievements: 0,
    };
  }

  // 카테고리·지역·가격 필터는 행사·학교·실적에는 적용할 수 없다. 검색어 없이 필터만 걸었을 때
  // 조건 없는 전체 목록이 결과로 섞여 나오지 않도록 이 유형들은 검색어가 있을 때만 조회한다.
  if (!hasQuery) {
    return {
      programs: [],
      events: [],
      schools: [],
      achievements: [],
      totalPrograms: 0,
      totalEvents: 0,
      totalSchools: 0,
      totalAchievements: 0,
    };
  }

  if (type === "events") {
    const eventWhere: EventWhereInput = {};
    if (hasQuery) {
      eventWhere.OR = [
        { location: { contains: searchQuery, mode: "insensitive" as const } },
        { school: { name: { contains: searchQuery, mode: "insensitive" as const } } },
        { program: { title: { contains: searchQuery, mode: "insensitive" as const } } },
        { program: { category: { contains: searchQuery, mode: "insensitive" as const } } },
      ];
    }

    const [events, totalEvents] = await Promise.all([
      prisma.event.findMany({
        where: eventWhere,
        include: {
          school: true,
          program: {
            include: {
              images: {
                take: 1,
                orderBy: { createdAt: "asc" },
              },
            },
          },
          images: {
            take: 1,
            orderBy: { createdAt: "asc" },
          },
        },
        skip,
        take: ITEMS_PER_TYPE,
        orderBy: { date: "desc" },
      }),
      prisma.event.count({ where: eventWhere }),
    ]);

    return {
      programs: [],
      events,
      schools: [],
      achievements: [],
      totalPrograms: 0,
      totalEvents,
      totalSchools: 0,
      totalAchievements: 0,
    };
  }

  if (type === "schools") {
    const schoolWhere: SchoolWhereInput = {};
    if (hasQuery) {
      schoolWhere.name = { contains: searchQuery, mode: "insensitive" as const };
    }

    const [schools, totalSchools] = await Promise.all([
      prisma.school.findMany({
        where: schoolWhere,
        skip,
        take: ITEMS_PER_TYPE,
        orderBy: { name: "asc" },
      }),
      prisma.school.count({ where: schoolWhere }),
    ]);

    return {
      programs: [],
      events: [],
      schools,
      achievements: [],
      totalPrograms: 0,
      totalEvents: 0,
      totalSchools,
      totalAchievements: 0,
    };
  }

  if (type === "achievements") {
    const achievementWhere: AchievementWhereInput = {};
    if (hasQuery) {
      achievementWhere.OR = [
        { institution: { contains: searchQuery, mode: "insensitive" as const } },
        { content: { contains: searchQuery, mode: "insensitive" as const } },
      ];
    }

    const [achievements, totalAchievements] = await Promise.all([
      prisma.achievement.findMany({
        where: achievementWhere,
        skip,
        take: ITEMS_PER_TYPE,
        orderBy: [{ year: "desc" }, { institution: "asc" }],
      }),
      prisma.achievement.count({ where: achievementWhere }),
    ]);

    return {
      programs: [],
      events: [],
      schools: [],
      achievements,
      totalPrograms: 0,
      totalEvents: 0,
      totalSchools: 0,
      totalAchievements,
    };
  }

  return {
    programs: [],
    events: [],
    schools: [],
    achievements: [],
    totalPrograms: 0,
    totalEvents: 0,
    totalSchools: 0,
    totalAchievements: 0,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
    region?: string;
    priceMin?: string;
    priceMax?: string;
    hashtag?: string;
    page?: string;
    programPage?: string;
    eventPage?: string;
    schoolPage?: string;
    achievementPage?: string;
    postPage?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const programPage = parsePositivePageParam(params.programPage);
  const eventPage = parsePositivePageParam(params.eventPage);
  const schoolPage = parsePositivePageParam(params.schoolPage);
  const achievementPage = parsePositivePageParam(params.achievementPage);
  const postPage = parsePositivePageParam(params.postPage);
  
  const filters: SearchFilters = {
    category: params.category,
    region: params.region,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    hashtag: params.hashtag,
  };
  
  // 각 타입별로 독립적으로 검색
  const [postResults, programResults, eventResults, schoolResults, achievementResults] = await Promise.all([
    searchPosts(query, filters, postPage),
    searchAll(query, filters, programPage, "programs"),
    searchAll(query, filters, eventPage, "events"),
    searchAll(query, filters, schoolPage, "schools"),
    searchAll(query, filters, achievementPage, "achievements"),
  ]);
  
  const results = {
    programs: programResults.programs,
    events: eventResults.events,
    schools: schoolResults.schools,
    achievements: achievementResults.achievements,
    totalPrograms: programResults.totalPrograms,
    totalEvents: eventResults.totalEvents,
    totalSchools: schoolResults.totalSchools,
    totalAchievements: achievementResults.totalAchievements,
  };

  const totalResults =
    postResults.totalPosts +
    results.totalPrograms +
    results.totalEvents +
    results.totalSchools +
    results.totalAchievements;

  const hasActiveFilters = Boolean(filters.category || filters.region || filters.priceMin || filters.priceMax || filters.hashtag);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {query ? `"${query}" 검색 결과` : "검색"}
        </h1>
        {(query || hasActiveFilters) && (
          <p className="text-text-gray">
            총 {totalResults}개의 결과를 찾았습니다.
          </p>
        )}
      </div>

      {/* 검색 바 및 필터 */}
      <Suspense fallback={<div className="mb-8 h-24 rounded-lg bg-gray-100 animate-pulse" />}>
        <div className="mb-8 space-y-4">
          <SearchBar placeholder="상품, 진행 내역, 학교 검색..." />
          <AdvancedSearchFilters />
        </div>
      </Suspense>

      {!query && !hasActiveFilters ? (
        <div className="text-center py-12 text-text-gray">
          검색어를 입력하거나 필터를 선택해주세요.
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-12 text-text-gray">
          {query ? `"${query}"` : "선택한 필터"}에 대한 검색 결과가 없습니다.
        </div>
      ) : (
        <div className="space-y-12">
          {/* 게시물(카드뉴스·소식) 결과 */}
          {postResults.totalPosts > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  카드뉴스·소식 ({postResults.totalPosts})
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {postResults.posts.map((post) => {
                  const externalLink = post.link?.trim();
                  const isExternal = !!externalLink?.startsWith("http");
                  return (
                    <Link
                      key={post.id}
                      href={externalLink || `/news/${post.id}`}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-[3/4] bg-gray-50">
                        {post.imageUrl && (
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-contain group-hover:scale-[1.03] transition-transform duration-200"
                          />
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        {(post.categories.length > 0 || isEnded(post.endDate)) && (
                          <p className="mb-1 text-xs text-brand-green-primary">
                            {isEnded(post.endDate) && (
                              <span className="mr-1.5 rounded bg-gray-500 px-1.5 py-0.5 font-bold text-white">종료</span>
                            )}
                            {post.categories.join(" · ")}
                          </p>
                        )}
                        <p className="text-sm sm:text-base font-medium text-text-dark line-clamp-2">
                          {stripBrandFromTitle(post.title)}
                        </p>
                        {post.summary && (
                          <p className="mt-1 text-xs sm:text-sm text-text-gray line-clamp-2">{post.summary}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {postResults.totalPosts > ITEMS_PER_TYPE && (
                <Pagination
                  currentPage={postPage}
                  totalPages={Math.ceil(postResults.totalPosts / ITEMS_PER_TYPE)}
                  baseUrl="/search"
                  searchParams={params}
                  pageParamName="postPage"
                />
              )}
            </section>
          )}

          {/* 프로그램 결과 */}
          {results.totalPrograms > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  프로그램 ({results.totalPrograms})
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.programs.map((program) => (
                  <ProgramCard
                    key={program.id}
                    id={program.id}
                    title={program.title}
                    category={program.category}
                    summary={program.summary}
                    thumbnailUrl={program.thumbnailUrl}
                    region={program.region}
                    hashtags={program.hashtags}
                    priceFrom={program.priceFrom}
                    priceTo={program.priceTo}
                    rating={program.rating}
                    reviewCount={program.reviewCount}
                    imageUrl={program.images[0]?.url}
                  />
                ))}
              </div>
              {results.totalPrograms > ITEMS_PER_TYPE && (
                <Pagination
                  currentPage={programPage}
                  totalPages={Math.ceil(results.totalPrograms / ITEMS_PER_TYPE)}
                  baseUrl="/search"
                  searchParams={params}
                  pageParamName="programPage"
                />
              )}
            </section>
          )}

          {/* 행사 결과 */}
          {results.totalEvents > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  행사 ({results.totalEvents})
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {getEventThumbnailUrl(event) && (
                      <div className="relative w-full h-48 bg-gray-100">
                        <Image
                          src={getEventThumbnailUrl(event)!}
                          alt={`${event.school.name} 행사`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className={`object-cover ${getEventThumbnailPosition(event)}`}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="text-sm text-brand-green-primary mb-2">
                        {format(new Date(event.date), "yyyy년 MM월 dd일")}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{event.school.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{event.program.title}</p>
                      <div className="text-sm text-gray-500">
                        {event.location} · 학생 {event.studentCount}명
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {results.totalEvents > ITEMS_PER_TYPE && (
                <Pagination
                  currentPage={eventPage}
                  totalPages={Math.ceil(results.totalEvents / ITEMS_PER_TYPE)}
                  baseUrl="/search"
                  searchParams={params}
                  pageParamName="eventPage"
                />
              )}
            </section>
          )}

          {/* 학교 결과 */}
          {results.totalSchools > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  학교 ({results.totalSchools})
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.schools.map((school) => (
                  <Link
                    key={school.id}
                    href={`/school/${school.id}`}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-text-dark">{school.name}</h3>
                  </Link>
                ))}
              </div>
              {results.totalSchools > ITEMS_PER_TYPE && (
                <Pagination
                  currentPage={schoolPage}
                  totalPages={Math.ceil(results.totalSchools / ITEMS_PER_TYPE)}
                  baseUrl="/search"
                  searchParams={params}
                  pageParamName="schoolPage"
                />
              )}
            </section>
          )}

          {/* 사업 실적 결과 */}
          {results.totalAchievements > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  사업 실적 ({results.totalAchievements})
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {results.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-text-dark">
                        {achievement.institution}
                      </h3>
                      <span className="text-sm text-brand-green font-semibold bg-brand-green/10 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                        {achievement.year}년
                      </span>
                    </div>
                    <p className="text-text-gray">{achievement.content}</p>
                  </div>
                ))}
              </div>
              {results.totalAchievements > ITEMS_PER_TYPE && (
                <Pagination
                  currentPage={achievementPage}
                  totalPages={Math.ceil(results.totalAchievements / ITEMS_PER_TYPE)}
                  baseUrl="/search"
                  searchParams={params}
                  pageParamName="achievementPage"
                />
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

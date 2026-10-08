import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { getEventThumbnailUrl, getEventThumbnailPosition } from "@/lib/event-utils";
import { format } from "date-fns";
import type { Metadata } from "next";
import { AdvancedSearchFilters } from "@/components/AdvancedSearchFilters";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { parsePositivePageParam } from "@/lib/search-params";
import { rankPosts } from "@/lib/post-search";
import { isEnded, stripBrandFromTitle } from "@/lib/news-utils";
import { PROGRAM_CATEGORIES as NEWS_CATEGORIES } from "@/lib/news-constants";
import type { Prisma } from "@prisma/client";

interface SearchFilters {
  category?: string;
  region?: string;
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

const contains = (value: string) => ({ contains: value, mode: "insensitive" as const });

/**
 * 홈페이지 게시물(카드뉴스·회사 소식) 검색.
 * 방문자가 프로그램 메뉴에서 실제로 보는 콘텐츠는 이 게시물들이라, 검색에서 빠지면
 * "포천", "하나투어"처럼 게시물에만 있는 내용은 결과가 0건으로 나온다.
 */
async function searchPosts(query: string, filters: SearchFilters, page: number) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const hasFilters = Boolean(filters.category || filters.region || filters.hashtag);
  if (tokens.length === 0 && !hasFilters) {
    return { posts: [], totalPosts: 0 };
  }

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

  const ranked = rankPosts(matches, tokens);

  const start = (page - 1) * ITEMS_PER_TYPE;
  return { posts: ranked.slice(start, start + ITEMS_PER_TYPE), totalPosts: ranked.length };
}

/**
 * 진행 내역(행사)·학교·사업 실적 검색. 카테고리·지역 필터는 이 유형들에 적용할 수 없으므로
 * 검색어가 있을 때만 조회한다(필터만 걸었을 때 조건 없는 전체 목록이 섞여 나오지 않게).
 *
 * 예전 프로그램 표(Program)는 따로 검색하지 않는다 — 방문자가 보는 프로그램 소개는 위의 게시물이고,
 * 예전 표의 항목은 진행 내역의 상위 기록이라 아래 행사 검색(프로그램명 포함)으로 이미 나온다.
 */
async function searchRecords(
  query: string,
  pages: { event: number; school: number; achievement: number }
) {
  const searchQuery = query.trim();
  if (!searchQuery) {
    return { events: [], schools: [], achievements: [], totalEvents: 0, totalSchools: 0, totalAchievements: 0 };
  }

  const eventWhere: Prisma.EventWhereInput = {
    OR: [
      { location: contains(searchQuery) },
      { school: { name: contains(searchQuery) } },
      { program: { title: contains(searchQuery) } },
      { program: { category: contains(searchQuery) } },
    ],
  };
  const schoolWhere: Prisma.SchoolWhereInput = { name: contains(searchQuery) };
  const achievementWhere: Prisma.AchievementWhereInput = {
    OR: [{ institution: contains(searchQuery) }, { content: contains(searchQuery) }],
  };
  const skip = (page: number) => (page - 1) * ITEMS_PER_TYPE;

  const [events, totalEvents, schools, totalSchools, achievements, totalAchievements] = await Promise.all([
    prisma.event.findMany({
      where: eventWhere,
      include: {
        school: true,
        program: { include: { images: { take: 1, orderBy: { createdAt: "asc" } } } },
        images: { take: 1, orderBy: { createdAt: "asc" } },
      },
      skip: skip(pages.event),
      take: ITEMS_PER_TYPE,
      orderBy: { date: "desc" },
    }),
    prisma.event.count({ where: eventWhere }),
    prisma.school.findMany({
      where: schoolWhere,
      skip: skip(pages.school),
      take: ITEMS_PER_TYPE,
      orderBy: { name: "asc" },
    }),
    prisma.school.count({ where: schoolWhere }),
    prisma.achievement.findMany({
      where: achievementWhere,
      skip: skip(pages.achievement),
      take: ITEMS_PER_TYPE,
      orderBy: [{ year: "desc" }, { institution: "asc" }],
    }),
    prisma.achievement.count({ where: achievementWhere }),
  ]);

  return { events, schools, achievements, totalEvents, totalSchools, totalAchievements };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string;
    category?: string;
    region?: string;
    hashtag?: string;
    page?: string;
    eventPage?: string;
    schoolPage?: string;
    achievementPage?: string;
    postPage?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const eventPage = parsePositivePageParam(params.eventPage);
  const schoolPage = parsePositivePageParam(params.schoolPage);
  const achievementPage = parsePositivePageParam(params.achievementPage);
  const postPage = parsePositivePageParam(params.postPage);
  
  const filters: SearchFilters = {
    category: params.category,
    region: params.region,
    hashtag: params.hashtag,
  };
  
  const [postResults, results] = await Promise.all([
    searchPosts(query, filters, postPage),
    searchRecords(query, { event: eventPage, school: schoolPage, achievement: achievementPage }),
  ]);

  const totalResults =
    postResults.totalPosts + results.totalEvents + results.totalSchools + results.totalAchievements;

  const hasActiveFilters = Boolean(filters.category || filters.region || filters.hashtag);

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
          <SearchBar placeholder="프로그램, 진행 내역, 학교 검색..." />
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
                  프로그램·소식 ({postResults.totalPosts})
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

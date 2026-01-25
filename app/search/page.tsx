import { prisma } from "@/lib/prisma";
import { ProgramCard } from "@/components/ProgramCard";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { AdvancedSearchFilters } from "@/components/AdvancedSearchFilters";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import type { ProgramWhereInput, EventWhereInput, SchoolWhereInput, AchievementWhereInput } from "@/types";

interface SearchFilters {
  category?: string;
  region?: string;
  priceMin?: string;
  priceMax?: string;
  hashtag?: string;
}

const ITEMS_PER_TYPE = 12; // 타입별 표시할 항목 수

// 페이지 재검증 시간 설정 (5분 - 검색 결과는 자주 변경될 수 있음)
export const revalidate = 300;

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
  }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const programPage = params.programPage ? parseInt(params.programPage, 10) : 1;
  const eventPage = params.eventPage ? parseInt(params.eventPage, 10) : 1;
  const schoolPage = params.schoolPage ? parseInt(params.schoolPage, 10) : 1;
  const achievementPage = params.achievementPage ? parseInt(params.achievementPage, 10) : 1;
  
  const filters: SearchFilters = {
    category: params.category,
    region: params.region,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    hashtag: params.hashtag,
  };
  
  // 각 타입별로 독립적으로 검색
  const [programResults, eventResults, schoolResults, achievementResults] = await Promise.all([
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
    results.totalPrograms +
    results.totalEvents +
    results.totalSchools +
    results.totalAchievements;

  const hasActiveFilters = Boolean(filters.category || filters.region || filters.priceMin || filters.priceMax || filters.hashtag);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {query ? `&quot;${query}&quot; 검색 결과` : "검색"}
        </h1>
        {(query || hasActiveFilters) && (
          <p className="text-text-gray">
            총 {totalResults}개의 결과를 찾았습니다.
          </p>
        )}
      </div>

      {/* 검색 바 및 필터 */}
      <div className="mb-8 space-y-4">
        <SearchBar placeholder="상품, 진행 내역, 학교 검색..." />
        <AdvancedSearchFilters />
      </div>

      {!query && !hasActiveFilters ? (
        <div className="text-center py-12 text-text-gray">
          검색어를 입력하거나 필터를 선택해주세요.
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-12 text-text-gray">
          {query ? `&quot;${query}&quot;` : "선택한 필터"}에 대한 검색 결과가 없습니다.
        </div>
      ) : (
        <div className="space-y-12">
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
                    {event.images[0] && (
                      <div className="relative w-full h-48 bg-gray-100">
                        <Image
                          src={event.images[0].url}
                          alt={`${event.school.name} 행사`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
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


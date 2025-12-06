import { prisma } from "@/lib/prisma";
import { ProgramCard } from "@/components/ProgramCard";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

async function searchAll(query: string) {
  const searchQuery = query.trim();
  if (!searchQuery) return { programs: [], events: [], schools: [], achievements: [] };

  const [programs, events, schools, achievements] = await Promise.all([
    // 프로그램 검색
    prisma.program.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { summary: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
          { region: { contains: searchQuery, mode: "insensitive" } },
          { hashtags: { hasSome: [searchQuery] } },
        ],
      },
      include: {
        images: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    // 행사 검색
    prisma.event.findMany({
      where: {
        OR: [
          { location: { contains: searchQuery, mode: "insensitive" } },
          { school: { name: { contains: searchQuery, mode: "insensitive" } } },
          { program: { title: { contains: searchQuery, mode: "insensitive" } } },
          { program: { category: { contains: searchQuery, mode: "insensitive" } } },
        ],
      },
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
      take: 6,
      orderBy: { date: "desc" },
    }),
    // 학교 검색
    prisma.school.findMany({
      where: {
        name: { contains: searchQuery, mode: "insensitive" },
      },
      take: 6,
      orderBy: { name: "asc" },
    }),
    // 사업 실적 검색
    prisma.achievement.findMany({
      where: {
        OR: [
          { institution: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      take: 6,
      orderBy: [{ year: "desc" }, { institution: "asc" }],
    }),
  ]);

  return { programs, events, schools, achievements };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const results = await searchAll(query);

  const totalResults =
    results.programs.length +
    results.events.length +
    results.schools.length +
    results.achievements.length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {query ? `"${query}" 검색 결과` : "검색"}
        </h1>
        {query && (
          <p className="text-text-gray">
            총 {totalResults}개의 결과를 찾았습니다.
          </p>
        )}
      </div>

      {!query ? (
        <div className="text-center py-12 text-text-gray">
          검색어를 입력해주세요.
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-12 text-text-gray">
          "{query}"에 대한 검색 결과가 없습니다.
        </div>
      ) : (
        <div className="space-y-12">
          {/* 프로그램 결과 */}
          {results.programs.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  프로그램 ({results.programs.length})
                </h2>
                {results.programs.length >= 6 && (
                  <Link
                    href="/programs"
                    className="text-brand-green hover:text-brand-green/80 text-sm"
                  >
                    전체 보기 →
                  </Link>
                )}
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
            </section>
          )}

          {/* 행사 결과 */}
          {results.events.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  행사 ({results.events.length})
                </h2>
                {results.events.length >= 6 && (
                  <Link
                    href="/events"
                    className="text-brand-green hover:text-brand-green/80 text-sm"
                  >
                    전체 보기 →
                  </Link>
                )}
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
            </section>
          )}

          {/* 학교 결과 */}
          {results.schools.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  학교 ({results.schools.length})
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
            </section>
          )}

          {/* 사업 실적 결과 */}
          {results.achievements.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-dark">
                  사업 실적 ({results.achievements.length})
                </h2>
                {results.achievements.length >= 6 && (
                  <Link
                    href="/achievements"
                    className="text-brand-green hover:text-brand-green/80 text-sm"
                  >
                    전체 보기 →
                  </Link>
                )}
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
            </section>
          )}
        </div>
      )}
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import { AchievementAccordion } from "@/components/AchievementAccordion";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { ChevronRight } from "lucide-react";

async function getAchievementsByYear() {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ year: "desc" }, { institution: "asc" }],
  });

  // 연도별로 그룹화
  const grouped: Record<number, typeof achievements> = {};
  achievements.forEach((achievement) => {
    if (!grouped[achievement.year]) {
      grouped[achievement.year] = [];
    }
    grouped[achievement.year].push(achievement);
  });

  // 연도 내림차순 정렬
  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return { grouped, years };
}

async function getRecentEvents() {
  try {
    return await prisma.event.findMany({
      take: 6,
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
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AchievementsPage() {
  const { grouped, years } = await getAchievementsByYear();
  const recentEvents = await getRecentEvents();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-medium mb-4">터치더월드 발자취</h1>
        <p className="text-lg text-text-gray">
          터치더월드는 다년간 축적된 경험과 노하우를 바탕으로, 학생들의 미래를 밝히는 글로벌 교육 솔루션을 제공합니다.
        </p>
      </div>

      {/* 최근 진행 행사 섹션 */}
      {recentEvents.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-text-dark">
              최근 진행 행사
            </h2>
            <Link
              href="/events"
              className="text-brand-green-primary hover:text-brand-green-primary/80 font-medium flex items-center gap-1 text-sm"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-brand-green-primary hover:shadow-lg transition-all bg-white"
              >
                {event.images[0] ? (
                  <div className="relative w-full h-36 sm:h-48 bg-gray-100">
                    <Image
                      src={event.images[0].url}
                      alt={`${event.school.name} 행사`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder className="h-36 sm:h-48 text-sm" text="행사 사진" />
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-brand-green-primary/10 text-brand-green-primary rounded-full font-medium">
                      {event.program.category}
                    </span>
                    <span className="text-xs text-text-gray">
                      {format(new Date(event.date), "yyyy.MM.dd")}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-text-dark mb-1 line-clamp-2">
                    {event.program.title}
                  </h3>
                  <div className="text-sm text-text-gray mb-1">
                    {event.school.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-gray">
                    <span>{event.location}</span>
                    <span>·</span>
                    <span>학생 {event.studentCount}명</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 사업 실적 섹션 */}
      <section>
        <h2 className="text-2xl font-medium text-text-dark mb-6">사업 실적</h2>
        {years.length === 0 ? (
          <div className="text-center py-12 text-text-gray">
            등록된 실적이 없습니다.
          </div>
        ) : (
          <AchievementAccordion years={years} grouped={grouped} />
        )}
      </section>
    </div>
  );
}

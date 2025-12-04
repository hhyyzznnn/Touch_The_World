import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

async function getAchievements(year?: number) {
  const where = year ? { year } : {};
  return await prisma.achievement.findMany({
    where,
    orderBy: [{ year: "desc" }, { institution: "asc" }],
  });
}

async function getYears() {
  const achievements = await prisma.achievement.findMany({
    select: { year: true },
    distinct: ["year"],
  });
  return achievements.map((a) => a.year).sort((a, b) => b - a);
}

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;
  const achievements = await getAchievements(year);
  const years = await getYears();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-4">터치더월드 발자취</h1>
        <p className="text-lg text-text-gray mb-6">
          터치더월드는 다년간 축적된 경험과 노하우를 바탕으로, 학생들의 미래를 밝히는 글로벌 교육 솔루션을 제공합니다.
        </p>
        {years.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant={!year ? "default" : "outline"}
              size="sm"
            >
              <a href="/achievements">전체</a>
            </Button>
            {years.map((y) => (
              <Button
                key={y}
                asChild
                variant={year === y ? "default" : "outline"}
                size="sm"
              >
                <a href={`/achievements?year=${y}`}>{y}년</a>
              </Button>
            ))}
          </div>
        )}
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          등록된 실적이 없습니다.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
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
      )}
    </div>
  );
}


import { getPersonalizedProgramRecommendations } from "@/lib/personalized-recommendations";
import { ProgramCard } from "@/components/ProgramCard";

interface PersonalizedRecommendationsProps {
  userId: string;
}

export async function PersonalizedRecommendations({
  userId,
}: PersonalizedRecommendationsProps) {
  const { profile, recommendations } = await getPersonalizedProgramRecommendations(
    userId,
    { limit: 3 }
  );

  if (recommendations.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-2">AI 개인화 추천</h2>
        <p className="text-sm text-gray-600">
          아직 추천을 만들 데이터가 부족합니다. AI 상담을 완료하거나 즐겨찾기를 추가하면
          회원님 선호에 맞춘 추천이 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow p-6 sm:p-8">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">AI 개인화 추천</h2>
        <p className="text-sm text-gray-600 mt-1">
          최근 상담 {profile.sourceCounts.consultingLogs}건 / 즐겨찾기{" "}
          {profile.sourceCounts.favorites}개를 바탕으로 추천했어요.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {recommendations.map((program) => (
          <div key={program.id} className="space-y-2">
            <ProgramCard
              id={program.id}
              title={program.title}
              category={program.category}
              summary={program.summary}
              thumbnailUrl={program.thumbnailUrl}
              imageUrl={program.imageUrl}
              region={program.region}
              priceFrom={program.priceFrom}
              priceTo={program.priceTo}
              rating={program.rating}
              reviewCount={program.reviewCount}
            />
            <p className="text-xs text-brand-green-primary">
              추천 이유: {program.reasons.join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

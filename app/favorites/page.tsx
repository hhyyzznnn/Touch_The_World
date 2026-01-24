import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-user";
import { redirect } from "next/navigation";
import { ProgramCard } from "@/components/ProgramCard";
import { EmptyState } from "@/components/EmptyState";
import { Heart } from "lucide-react";

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 사용자의 즐겨찾기 목록 가져오기
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      program: {
        include: {
          images: {
            take: 1,
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">즐겨찾기</h1>
        <p className="text-text-gray">
          저장한 프로그램을 한눈에 확인하세요.
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-16 h-16 text-gray-300" />}
          title="즐겨찾기가 없습니다"
          description="관심 있는 프로그램을 즐겨찾기에 추가해보세요."
          action={{
            label: "프로그램 보기",
            href: "/programs",
          }}
        />
      ) : (
        <>
          <div className="mb-4 text-sm text-text-gray">
            총 {favorites.length}개의 즐겨찾기
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const program = favorite.program;
              return (
                <ProgramCard
                  key={favorite.id}
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

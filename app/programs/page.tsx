import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/ProgramCard";
import { getCategoryDisplayName, getCategoryDetailKey } from "@/lib/category-utils";
import { CATEGORY_DETAILS } from "@/lib/category-details";
import { CategoryCardNews } from "@/components/CategoryCardNews";
import { Pagination } from "@/components/Pagination";
import { ProgramSort } from "@/components/ProgramSort";
import { Suspense } from "react";

const ITEMS_PER_PAGE = 12;

type SortOption = "latest" | "popular" | "rating" | "price_asc" | "price_desc" | "name";

function getOrderBy(sort: SortOption) {
  switch (sort) {
    case "popular":
      // 인기순: 후기 수 내림차순, 동일 시 최신순
      return [{ reviewCount: "desc" as const }, { createdAt: "desc" as const }];
    case "rating":
      // 평점순: 평점 내림차순, 동일 시 후기 수 내림차순, 최신순
      return [
        { rating: "desc" as const },
        { reviewCount: "desc" as const },
        { createdAt: "desc" as const }
      ];
    case "price_asc":
      // 가격 낮은순: 가격 오름차순, 동일 시 최신순
      // null 값은 데이터베이스에서 자동으로 뒤로 정렬됨
      return [{ priceFrom: "asc" as const }, { createdAt: "desc" as const }];
    case "price_desc":
      // 가격 높은순: 가격 내림차순, 동일 시 최신순
      // null 값은 데이터베이스에서 자동으로 뒤로 정렬됨
      return [{ priceFrom: "desc" as const }, { createdAt: "desc" as const }];
    case "name":
      // 이름순: 제목 오름차순
      return [{ title: "asc" as const }];
    case "latest":
    default:
      // 최신순: 생성일 내림차순
      return [{ createdAt: "desc" as const }];
  }
}

async function getPrograms(category?: string, page: number = 1, sort: SortOption = "latest") {
  const where = category ? { category } : {};
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const orderBy = getOrderBy(sort);
  
  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.program.count({ where }),
  ]);
  
  return {
    programs,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  };
}

async function getCategories() {
  // distinct 쿼리로 최적화 (데이터베이스에서 직접 중복 제거)
  const categories = await prisma.program.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return categories.map((p) => p.category);
}

// 페이지 재검증 시간 설정 (10분)
export const revalidate = 600;

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const sort = (params.sort || "latest") as SortOption;
  const { programs, totalPages } = await getPrograms(params.category, currentPage, sort);
  const categories = await getCategories();
  
  // 카테고리별 상세 정보 가져오기
  const categoryDetailKey = params.category ? getCategoryDetailKey(params.category) : null;
  const categoryDetail = categoryDetailKey ? CATEGORY_DETAILS[categoryDetailKey] : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">프로그램 목록</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            asChild
            variant={!params.category ? "default" : "outline"}
            className={!params.category ? "bg-brand-green-primary hover:bg-brand-green-primary/90 text-white" : "bg-white border-gray-300 text-text-dark hover:border-brand-green-primary hover:bg-brand-green-primary/5"}
          >
            <Link href="/programs">전체</Link>
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              asChild
              variant={params.category === category ? "default" : "outline"}
              className={params.category === category ? "bg-brand-green-primary hover:bg-brand-green-primary/90 text-white" : "bg-white border-gray-300 text-text-dark hover:border-brand-green-primary hover:bg-brand-green-primary/5"}
            >
              <Link href={`/programs?category=${encodeURIComponent(category)}`}>
                {getCategoryDisplayName(category)}
              </Link>
            </Button>
          ))}
        </div>
        <Suspense fallback={<div className="h-10" />}>
          <ProgramSort />
        </Suspense>
      </div>

      {/* 카테고리별 카드뉴스 */}
      {categoryDetail && (
        <CategoryCardNews categoryDetail={categoryDetail} />
      )}

      {programs.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          등록된 프로그램이 없습니다.
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                id={program.id}
                title={program.title}
                category={getCategoryDisplayName(program.category)}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/programs"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}


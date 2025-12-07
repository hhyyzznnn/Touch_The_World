import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/ProgramCard";

async function getPrograms(category?: string) {
  const where = category ? { category } : {};
  return await prisma.program.findMany({
    where,
    include: {
      images: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  const programs = await prisma.program.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return programs.map((p) => p.category);
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const programs = await getPrograms(params.category);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">프로그램 목록</h1>
        <div className="flex flex-wrap gap-2">
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
                {category}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          등록된 프로그램이 없습니다.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
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
      )}
    </div>
  );
}


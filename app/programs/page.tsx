import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  searchParams: { category?: string };
}) {
  const programs = await getPrograms(searchParams.category);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">프로그램 목록</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant={!searchParams.category ? "default" : "outline"}
          >
            <Link href="/programs">전체</Link>
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              asChild
              variant={searchParams.category === category ? "default" : "outline"}
            >
              <Link href={`/programs?category=${encodeURIComponent(category)}`}>
                {category}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 프로그램이 없습니다.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {program.images[0] && (
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={program.images[0].url}
                    alt={program.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="text-sm text-primary mb-2">{program.category}</div>
                <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
                {program.summary && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {program.summary}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


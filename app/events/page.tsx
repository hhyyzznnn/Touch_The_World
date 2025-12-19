import { prisma } from "@/lib/prisma";
import { getCategoryDisplayName } from "@/lib/category-utils";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { EventFilters } from "@/components/EventFilters";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

async function getEvents(
  year?: string,
  category?: string,
  location?: string,
  searchQuery?: string
) {
  const where: any = {};

  if (year) {
    if (year === "before-2022") {
      // 2022년 이전
      const endDate = new Date("2021-12-31T23:59:59");
      where.date = { lte: endDate };
    } else {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      where.date = { gte: startDate, lte: endDate };
    }
  }

  if (category) {
    where.program = { category };
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (searchQuery) {
    where.OR = [
      { program: { title: { contains: searchQuery, mode: "insensitive" } } },
      { location: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  return await prisma.event.findMany({
    where,
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
}

async function getYears() {
  const events = await prisma.event.findMany({
    select: { date: true },
  });
  const yearSet = new Set(
    events.map((e) => new Date(e.date).getFullYear())
  );
  const years = Array.from(yearSet).sort((a, b) => b - a);
  
  // 2022년 이후만 개별 표시, 2022년 이전은 통합
  const recentYears = years.filter((y) => y >= 2022).map((y) => y.toString());
  const hasBefore2022 = years.some((y) => y < 2022);
  
  const result: Array<{ value: string; label: string }> = [];
  if (hasBefore2022) {
    result.push({ value: "before-2022", label: "2022년 이전" });
  }
  recentYears.forEach((year) => {
    result.push({ value: year, label: `${year}년` });
  });
  
  return result;
}

async function getCategories() {
  const events = await prisma.event.findMany({
    include: { program: { select: { category: true } } },
  });
  const categories = new Set(
    events.map((e) => e.program.category).filter(Boolean)
  );
  return Array.from(categories).sort();
}

async function getLocations() {
  const events = await prisma.event.findMany({
    select: { location: true },
    distinct: ["location"],
  });
  return events
    .map((e) => e.location)
    .filter(Boolean)
    .sort();
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    category?: string;
    location?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const events = await getEvents(
    params.year,
    params.category,
    params.location,
    params.q
  );
  const years = await getYears();
  const categories = await getCategories();
  const locations = await getLocations();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-medium mb-2">행사 포트폴리오</h1>
        <p className="text-text-gray">
          터치더월드가 진행한 다양한 교육 행사를 확인하세요.
        </p>
      </div>

      <EventFilters
        years={years}
        categories={categories}
        locations={locations}
      />

      {events.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          <p className="text-lg mb-2">등록된 행사가 없습니다.</p>
          <p className="text-sm text-gray-500">
            필터 조건을 변경해보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-text-gray">
            총 {events.length}개의 행사
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-brand-green-primary hover:shadow-lg transition-all bg-white"
              >
                {event.images[0] ? (
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={event.images[0].url}
                      alt={`${event.school.name} 행사`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder className="h-48" text="행사 사진" />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-brand-green-primary/10 text-brand-green-primary rounded-full font-medium">
                      {getCategoryDisplayName(event.program.category)}
                    </span>
                    <span className="text-xs text-text-gray">
                      {format(new Date(event.date), "yyyy.MM.dd")}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-text-dark mb-2 line-clamp-2">
                    {event.program.title}
                  </h3>
                  <div className="text-sm text-text-gray mb-2">
                    {event.school.name}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-gray">
                    <span>{event.location}</span>
                    <span>·</span>
                    <span>학생 {event.studentCount}명</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

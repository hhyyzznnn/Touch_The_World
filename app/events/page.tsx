import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

async function getEvents(schoolId?: string, year?: string) {
  const where: any = {};
  if (schoolId) where.schoolId = schoolId;
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    where.date = { gte: startDate, lte: endDate };
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

async function getSchools() {
  return await prisma.school.findMany({
    orderBy: { name: "asc" },
  });
}

async function getYears() {
  const events = await prisma.event.findMany({
    select: { date: true },
  });
  const years = new Set(
    events.map((e) => new Date(e.date).getFullYear().toString())
  );
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { schoolId?: string; year?: string };
}) {
  const events = await getEvents(searchParams.schoolId, searchParams.year);
  const schools = await getSchools();
  const years = await getYears();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">행사 포트폴리오</h1>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">학교:</span>
            <Button
              asChild
              variant={!searchParams.schoolId ? "default" : "outline"}
              size="sm"
            >
              <Link href="/events">전체</Link>
            </Button>
            {schools.map((school) => (
              <Button
                key={school.id}
                asChild
                variant={searchParams.schoolId === school.id ? "default" : "outline"}
                size="sm"
              >
                <Link href={`/events?schoolId=${school.id}`}>{school.name}</Link>
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">연도:</span>
            <Button
              asChild
              variant={!searchParams.year ? "default" : "outline"}
              size="sm"
            >
              <Link href="/events">전체</Link>
            </Button>
            {years.map((year) => (
              <Button
                key={year}
                asChild
                variant={searchParams.year === year ? "default" : "outline"}
                size="sm"
              >
                <Link href={`/events?year=${year}`}>{year}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 행사가 없습니다.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
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
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="text-sm text-primary mb-2">
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
      )}
    </div>
  );
}


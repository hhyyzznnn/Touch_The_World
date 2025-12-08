import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

async function getSchool(id: string) {
  return await prisma.school.findUnique({
    where: { id },
    include: {
      events: {
        include: {
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
      },
    },
  });
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchool(id);

  if (!school) {
    notFound();
  }

  const eventsByYear = school.events.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<string, typeof school.events>);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        {school.logoUrl && (
          <div className="mb-4">
            <Image
              src={school.logoUrl}
              alt={school.name}
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
        )}
        <h1
          className="text-4xl font-bold mb-4"
          style={school.themeColor ? { color: school.themeColor } : {}}
        >
          {school.name}
        </h1>
        <p className="text-gray-600">
          총 {school.events.length}개의 행사가 진행되었습니다.
        </p>
      </div>

      {Object.keys(eventsByYear).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 행사가 없습니다.
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(eventsByYear)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([year, events]) => (
              <div key={year}>
                <h2 className="text-2xl font-semibold mb-6">{year}년</h2>
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
                            alt={`${school.name} 행사`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="text-sm text-brand-green-primary mb-2">
                          {format(new Date(event.date), "yyyy년 MM월 dd일")}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {event.program.title}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {event.location} · 학생 {event.studentCount}명
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}


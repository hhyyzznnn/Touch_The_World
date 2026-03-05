import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";

async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
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
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

async function getEventSeoData(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      location: true,
      school: {
        select: { name: true },
      },
      program: {
        select: {
          title: true,
          category: true,
        },
      },
      images: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { url: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventSeoData(id);

  if (!event) {
    return {
      title: "행사 정보 | 터치더월드",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${event.school.name} ${event.program.title} 행사 | 터치더월드`;
  const description = `${format(new Date(event.date), "yyyy년 MM월 dd일")} ${event.location}에서 진행한 ${event.program.title} 행사 사례입니다.`;

  return {
    title,
    description,
    keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, [
      event.program.category,
      event.program.title,
      event.school.name,
      event.location,
      "행사 사례",
    ]),
    alternates: {
      canonical: `/events/${event.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/events/${event.id}`,
      type: "article",
      images: event.images[0]?.url ? [event.images[0].url] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/events" className="text-brand-green-primary hover:underline">
          ← 행사 목록으로
        </Link>
      </div>

      <div className="mb-8">
        <div className="text-sm text-brand-green-primary mb-2">
          {format(new Date(event.date), "yyyy년 MM월 dd일")}
        </div>
        <h1 className="text-4xl font-bold mb-4">{event.school.name}</h1>
        <div className="text-lg text-gray-600 mb-2">{event.program.title}</div>
        <div className="text-gray-500">
          {event.location} · 학생 {event.studentCount}명
        </div>
      </div>

      {event.images.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">행사 사진</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.images.map((image) => (
              <div
                key={image.id}
                className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden"
              >
                <Image
                  src={image.url}
                  alt={`${event.school.name} 행사 사진`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">프로그램 정보</h2>
        <Link
          href={`/programs/${event.program.id}`}
          className="block hover:opacity-80 transition"
        >
          {event.program.images[0] && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={event.program.images[0].url}
                alt={event.program.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2">{event.program.title}</h3>
          {event.program.summary && (
            <p className="text-gray-600 text-sm">{event.program.summary}</p>
          )}
        </Link>
      </div>

      <div className="mt-8 pt-8 border-t">
        <Button asChild size="lg">
          <Link href={`/school/${event.school.id}`}>
            {event.school.name} 페이지 보기
          </Link>
        </Button>
      </div>
    </div>
  );
}

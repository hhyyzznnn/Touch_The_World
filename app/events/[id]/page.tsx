import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Quote, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCategoryDisplayName } from "@/lib/category-utils";
import {
  formatEventPeriod,
  getEventStatusLabel,
  getEventThumbnailPosition,
  getEventThumbnailUrl,
} from "@/lib/event-utils";
import { parseThumbnailFocus } from "@/lib/thumbnail-focus";
import { BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

// generateMetadata와 페이지 본문이 같은 id로 각각 호출해도 요청당 1회만 DB 조회하도록 캐싱
const getEvent = cache(async (id: string) => {
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
});

async function getRelatedEvents(event: NonNullable<Awaited<ReturnType<typeof getEvent>>>) {
  const candidates = await prisma.event.findMany({
    where: {
      id: { not: event.id },
      OR: [{ programId: event.programId }, { program: { category: event.program.category } }],
    },
    orderBy: { date: "desc" },
    take: 9,
    include: {
      school: true,
      program: { select: { title: true, category: true } },
      images: { take: 1, orderBy: { createdAt: "asc" } },
    },
  });
  // 같은 프로그램으로 진행한 행사를 먼저, 그다음 같은 유형(카테고리) 행사
  const sameProgram = candidates.filter((e) => e.programId === event.programId);
  const sameCategory = candidates.filter((e) => e.programId !== event.programId);
  return [...sameProgram, ...sameCategory].slice(0, 3);
}

async function getNeighborEvents(event: NonNullable<Awaited<ReturnType<typeof getEvent>>>) {
  const select = {
    id: true,
    school: { select: { name: true } },
    program: { select: { title: true } },
  } as const;
  const [older, newer] = await Promise.all([
    prisma.event.findFirst({ where: { date: { lt: event.date } }, orderBy: { date: "desc" }, select }),
    prisma.event.findFirst({ where: { date: { gt: event.date } }, orderBy: { date: "asc" }, select }),
  ]);
  return { older, newer };
}

async function getLinkedCardNews(cardNewsId: string | null) {
  if (!cardNewsId) return null;
  return await prisma.companyNews.findUnique({
    where: { id: cardNewsId },
    select: { id: true, title: true, imageUrls: true },
  });
}

async function getProgramReviews(programId: string) {
  const [aggregate, latest] = await Promise.all([
    prisma.review.aggregate({ where: { programId }, _avg: { rating: true }, _count: true }),
    prisma.review.findMany({
      where: { programId },
      orderBy: { createdAt: "desc" },
      take: 2,
      include: { user: { select: { name: true } } },
    }),
  ]);
  return {
    count: aggregate._count,
    average: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
    latest,
  };
}

async function getRelatedPrograms(programId: string, category: string) {
  return await prisma.program.findMany({
    where: { category, id: { not: programId } },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, summary: true, category: true, thumbnailUrl: true },
  });
}

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

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
  const period = formatEventPeriod(event.date, event.endDate);
  const description =
    event.notes?.replace(/\s+/g, " ").trim().slice(0, 150) ||
    `${period} ${event.location}에서 진행한 ${event.program.title} 행사 사례입니다.`;

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
      images: getEventThumbnailUrl(event) ? [getEventThumbnailUrl(event)!] : undefined,
    },
  };
}

function RatingStars({ value, className = "w-4 h-4" }: { value: number; className?: string }) {
  return (
    <div className="flex" aria-label={`평점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${className} ${
            star <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
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

  const [relatedEvents, { older, newer }, programReviews, relatedPrograms, linkedCardNews] = await Promise.all([
    getRelatedEvents(event),
    getNeighborEvents(event),
    getProgramReviews(event.programId),
    getRelatedPrograms(event.programId, event.program.category),
    getLinkedCardNews(event.cardNewsId),
  ]);
  const thumbnailUrl = getEventThumbnailUrl(event);

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/events/${event.id}`;
  const period = formatEventPeriod(event.date, event.endDate);
  const programThumb = parseThumbnailFocus(event.program.thumbnailUrl);
  // 프로그램 대표 이미지가 위에 크게 보여주는 요약 카드와 같은 이미지면 중복 노출하지 않는다
  const candidateProgramImage = event.program.images[0]?.url || programThumb.imageUrl;
  const programImageUrl = candidateProgramImage === event.summaryCardUrl ? null : candidateProgramImage;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${event.school.name} ${event.program.title}`,
    ...(event.notes ? { description: event.notes } : {}),
    startDate: event.date.toISOString(),
    endDate: (event.endDate ?? event.date).toISOString(),
    location: {
      "@type": "Place",
      name: event.location,
      address: { "@type": "PostalAddress", addressCountry: "KR" },
    },
    organizer: {
      "@type": "Organization",
      name: "터치더월드",
      url: siteUrl,
    },
    url: pageUrl,
    ...(thumbnailUrl ? { image: thumbnailUrl } : {}),
    ...(event.reviewContent
      ? {
          review: {
            "@type": "Review",
            reviewBody: event.reviewContent,
            author: { "@type": "Person", name: event.reviewAuthor || "학교 담당자" },
          },
        }
      : {}),
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "행사 포트폴리오", href: "/events" },
          { label: event.school.name },
        ]}
      />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs px-2.5 py-1 bg-brand-green-primary/10 text-brand-green-primary rounded-full font-medium">
            {getCategoryDisplayName(event.program.category)}
          </span>
          <span className="text-xs px-2.5 py-1 bg-gray-100 text-text-gray rounded-full font-medium">
            {getEventStatusLabel(event.status)}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 break-words">{event.school.name}</h1>
        <Link
          href={`/programs/${event.programId}`}
          className="text-lg sm:text-xl text-text-gray hover:text-brand-green-primary transition-colors break-words"
        >
          {event.program.title}
        </Link>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-gray">
          <li className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" aria-hidden />
            {period}
          </li>
          {event.location && (
            <li className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" aria-hidden />
              {event.location}
            </li>
          )}
          {event.studentCount != null && (
            <li className="flex items-center gap-1.5">
              <Users className="w-4 h-4" aria-hidden />
              학생 {event.studentCount}명
            </li>
          )}
        </ul>
      </header>

      <div
        className={
          event.summaryCardUrl
            ? "lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-10 lg:items-start"
            : ""
        }
      >
        {event.summaryCardUrl && (
          <aside className="mb-10 lg:mb-0 lg:sticky lg:top-24" aria-label="행사 요약 카드">
            <a
              href={event.summaryCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="행사 요약 카드 크게 보기"
              className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <Image
                src={event.summaryCardUrl}
                alt={`${event.school.name} ${event.program.title} 행사 요약 카드`}
                width={1536}
                height={2304}
                sizes="(max-width: 1024px) 100vw, 384px"
                className="w-full h-auto"
                priority
              />
            </a>
            {linkedCardNews && (
              <Link
                href={`/news/${linkedCardNews.id}`}
                className="mt-3 flex items-center justify-between rounded-xl border border-brand-green-primary/30 bg-brand-green-primary/5 px-4 py-3 text-sm font-medium text-brand-green-primary hover:bg-brand-green-primary/10 transition-colors"
              >
                <span>
                  카드뉴스로 자세히 보기
                  {linkedCardNews.imageUrls.length > 1 ? ` (${linkedCardNews.imageUrls.length}장)` : ""}
                </span>
                <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            )}
          </aside>
        )}
        <div className="min-w-0">
      {event.images.length > 0 && (
        <section className="mb-10" aria-label="행사 사진">
          <div
            className={
              event.images.length === 1
                ? "grid grid-cols-1"
                : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {event.images.map((image) => (
              <div
                key={image.id}
                className={`relative w-full bg-gray-100 rounded-xl overflow-hidden ${
                  event.images.length === 1 ? "h-64 sm:h-[26rem]" : "h-64"
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${event.school.name} ${event.program.title} 행사 사진`}
                  fill
                  sizes={
                    event.images.length === 1
                      ? "(max-width: 1024px) 100vw, 1024px"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-cover"
                  priority={event.images.length === 1}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {event.notes && (
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">행사 소개</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.notes}</p>
        </section>
      )}

      {event.reviewContent && (
        <section className="mb-10" aria-label="담당자 후기">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">담당자 후기</h2>
          <figure className="relative rounded-xl border border-brand-green-primary/20 bg-brand-green-primary/5 p-6 sm:p-8">
            <Quote className="w-6 h-6 text-brand-green-primary/40 mb-3" aria-hidden />
            <blockquote className="text-gray-800 leading-relaxed whitespace-pre-line">
              {event.reviewContent}
            </blockquote>
            <figcaption className="mt-4 text-sm font-medium text-text-gray">
              — {event.reviewAuthor || "학교 담당자"}
            </figcaption>
          </figure>
        </section>
      )}

      <section className="mb-10" aria-label="진행 프로그램">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3">이 행사의 프로그램</h2>
        <div className="flex flex-col sm:flex-row gap-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          {programImageUrl && (
            <Link
              href={`/programs/${event.programId}`}
              className="relative block w-full sm:w-64 h-44 sm:h-auto sm:min-h-[10rem] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={programImageUrl}
                alt={event.program.title}
                fill
                sizes="(max-width: 640px) 100vw, 256px"
                className="object-cover"
              />
            </Link>
          )}
          <div className="flex flex-col justify-between gap-4 min-w-0">
            <div>
              <h3 className="text-lg font-semibold mb-1.5 break-words">{event.program.title}</h3>
              {event.program.summary && (
                <p className="text-sm text-text-gray leading-relaxed">{event.program.summary}</p>
              )}
              {programReviews.count > 0 && (
                <Link
                  href={`/programs/${event.programId}#reviews`}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-text-gray hover:text-brand-green-primary"
                >
                  <RatingStars value={programReviews.average} />
                  <span>
                    {programReviews.average.toFixed(1)} · 후기 {programReviews.count}개
                  </span>
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/programs/${event.programId}`}>프로그램 자세히 보기</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/inquiry?type=quick">우리 학교도 문의하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

        </div>
      </div>

      {programReviews.latest.length > 0 && (
        <section className="mb-10" aria-label="프로그램 후기">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold">이 프로그램을 다녀온 분들의 후기</h2>
            <Link
              href={`/programs/${event.programId}#reviews`}
              className="text-sm text-brand-green-primary hover:underline flex-shrink-0"
            >
              전체 보기
            </Link>
          </div>
          <ul className="space-y-3">
            {programReviews.latest.map((review) => (
              <li key={review.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{review.user.name}</span>
                  <RatingStars value={review.rating} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{review.content}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedEvents.length > 0 && (
        <section className="mb-10" aria-label="다른 행사">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">비슷한 행사</h2>
            <Link href="/events" className="text-sm text-brand-green-primary hover:underline flex-shrink-0">
              전체 행사 보기
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedEvents.map((rel) => (
              <Link
                key={rel.id}
                href={`/events/${rel.id}`}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-brand-green-primary hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {getEventThumbnailUrl(rel) ? (
                    <Image
                      src={getEventThumbnailUrl(rel)!}
                      alt={`${rel.school.name} 행사`}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className={`object-cover ${getEventThumbnailPosition(rel)} group-hover:scale-[1.03] transition-transform duration-200`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-text-gray mb-1">{formatEventPeriod(rel.date, rel.endDate)}</div>
                  <p className="text-sm font-semibold text-text-dark line-clamp-1">{rel.school.name}</p>
                  <p className="text-xs text-text-gray line-clamp-1">{rel.program.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedPrograms.length > 0 && (
        <section className="mb-10" aria-label="비슷한 프로그램">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">비슷한 프로그램</h2>
            <Link
              href={`/programs?category=${encodeURIComponent(event.program.category)}`}
              className="text-sm text-brand-green-primary hover:underline flex-shrink-0"
            >
              전체 보기
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPrograms.map((rel) => {
              const thumb = parseThumbnailFocus(rel.thumbnailUrl);
              return (
                <Link
                  key={rel.id}
                  href={`/programs/${rel.id}`}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {thumb.imageUrl ? (
                      <Image
                        src={thumb.imageUrl}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-brand-green-primary">
                      {getCategoryDisplayName(rel.category)}
                    </span>
                    <p className="text-sm font-semibold text-text-dark line-clamp-2 leading-snug">{rel.title}</p>
                    {rel.summary && <p className="text-xs text-text-gray line-clamp-2">{rel.summary}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <nav
        aria-label="이전·다음 행사"
        className="grid gap-3 sm:grid-cols-2 pt-8 border-t border-gray-100"
      >
        {older ? (
          <Link
            href={`/events/${older.id}`}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-green-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-gray flex-shrink-0" aria-hidden />
            <div className="min-w-0">
              <div className="text-xs text-text-gray mb-0.5">이전 행사</div>
              <div className="text-sm font-medium truncate">{older.school.name}</div>
              <div className="text-xs text-text-gray truncate">{older.program.title}</div>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link
            href={`/events/${newer.id}`}
            className="flex items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4 text-right hover:border-brand-green-primary transition-colors sm:col-start-2"
          >
            <div className="min-w-0">
              <div className="text-xs text-text-gray mb-0.5">다음 행사</div>
              <div className="text-sm font-medium truncate">{newer.school.name}</div>
              <div className="text-xs text-text-gray truncate">{newer.program.title}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-gray flex-shrink-0" aria-hidden />
          </Link>
        )}
      </nav>

      <div className="mt-10 rounded-2xl bg-brand-green-primary px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-lg">우리 학교도 이런 행사를 준비하고 계신가요?</p>
          <p className="text-white/80 text-sm mt-0.5">일정·인원·예산만 알려주시면 맞춤 견적을 보내드립니다.</p>
        </div>
        <Link
          href="/inquiry?type=quick"
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white text-brand-green-primary font-semibold px-5 py-2.5 text-sm hover:bg-white/90 active:scale-[0.97] transition-all"
        >
          빠른 문의하기
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

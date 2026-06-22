import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReviewSection } from "@/components/ReviewSection";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";
import { ProgramImage } from "@/components/programs/ProgramImage";
import { PrintQuoteButton } from "@/components/programs/PrintQuoteButton";
import remarkGfm from "remark-gfm";
import { BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { parseThumbnailFocus } from "@/lib/thumbnail-focus";
import { getSiteUrl } from "@/lib/site-url";

async function getProgram(id: string) {
  return await prisma.program.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { createdAt: "asc" },
      },
      schedules: {
        orderBy: { day: "asc" },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // 최근 10개만 미리 로드
      },
    },
  });
}

async function getRelatedPrograms(id: string, category: string) {
  const FIELDS = {
    id: true,
    title: true,
    summary: true,
    category: true,
    thumbnailUrl: true,
    region: true,
  } as const;

  // 같은 카테고리 우선
  const sameCat = await prisma.program.findMany({
    where: { category, id: { not: id } },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: FIELDS,
  });
  if (sameCat.length > 0) return { programs: sameCat, sameCategory: true };

  // 없으면 카테고리 무관하게 다른 프로그램
  const any = await prisma.program.findMany({
    where: { id: { not: id } },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: FIELDS,
  });
  return { programs: any, sameCategory: false };
}

async function getProgramSeoData(id: string) {
  return await prisma.program.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      summary: true,
      category: true,
      thumbnailUrl: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = await getProgramSeoData(id);

  if (!program) {
    return {
      title: "프로그램 정보 | 터치더월드",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryName = getCategoryDisplayName(program.category);
  const parsedThumbnail = parseThumbnailFocus(program.thumbnailUrl);
  const description =
    program.summary ||
    `터치더월드의 ${categoryName} 프로그램 상세 정보를 확인하세요.`;

  return {
    title: `${program.title} | ${categoryName} | 터치더월드`,
    description,
    keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, [categoryName, program.title]),
    alternates: {
      canonical: `/programs/${program.id}`,
    },
    openGraph: {
      title: `${program.title} | 터치더월드`,
      description,
      url: `/programs/${program.id}`,
      type: "article",
      images: parsedThumbnail.imageUrl ? [parsedThumbnail.imageUrl] : undefined,
    },
  };
}

// 페이지 재검증 시간 설정 (5분)
export const revalidate = 300;

// 마크다운 전처리: • 기호와 키-값 쌍을 마크다운 형식으로 변환
function preprocessMarkdown(text: string): string {
  const lines = text.split('\n');
  const processed: string[] = [];
  
  // 프로그램 개요 같은 키-값 쌍 패턴 (예: "운영 기간:", "대상:", "인원:", "숙박:")
  const keyValuePatterns = [
    '운영 기간:', '대상:', '인원:', '숙박:', '기간:', '장소:', '비용:', '가격:',
    '포함 내역:', '제외 내역:', '준비물:', '주의사항:', '유의사항:', '문의:'
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.match(/^(\s*)/)?.[1] || '';
    
    // • 기호로 시작하는 줄 처리
    if (trimmed.startsWith('•')) {
      const bulletPoints = trimmed.split(/\s+•\s+/).filter(item => item.trim());
      
      if (bulletPoints.length > 1) {
        bulletPoints.forEach((item) => {
          const itemText = item.trim();
          if (itemText) {
            processed.push(`${indent}- ${itemText}`);
          }
        });
      } else {
        processed.push(line.replace(/^(\s*)•\s*/, '$1- '));
      }
    }
    // 키-값 쌍 패턴 감지 및 분리
    else {
      // 한 줄에 여러 키-값 쌍이 있는지 확인 (예: "운영 기간: ... 대상: ... 인원: ...")
      const foundPatterns = keyValuePatterns.filter(pattern => trimmed.includes(pattern));
      
      if (foundPatterns.length > 1) {
        // 여러 패턴이 있으면 각각 분리
        let currentText = trimmed;
        const parts: string[] = [];
        
        // 각 패턴의 위치를 찾아서 정렬
        const positions: Array<{pattern: string; index: number}> = [];
        foundPatterns.forEach(pattern => {
          const index = currentText.indexOf(pattern);
          if (index >= 0) {
            positions.push({ pattern, index });
          }
        });
        positions.sort((a, b) => a.index - b.index);
        
        // 각 패턴을 기준으로 분리
        positions.forEach((pos, idx) => {
          const start = pos.index;
          const end = idx < positions.length - 1 
            ? positions[idx + 1].index 
            : currentText.length;
          
          const part = currentText.substring(start, end).trim();
          if (part) {
            parts.push(part);
          }
        });
        
        // 분리된 부분들을 각각 별도 줄로 추가
        parts.forEach(part => {
          if (part.trim()) {
            processed.push(`${indent}${part}`);
          }
        });
      } else {
        // 단일 패턴이거나 패턴이 없으면 그대로 추가
        processed.push(line);
      }
    }
  }
  
  return processed.join('\n');
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgram(id);

  if (!program) {
    notFound();
  }
  const [parsedThumbnail, { programs: relatedPrograms, sameCategory: relatedSameCategory }] = await Promise.all([
    Promise.resolve(parseThumbnailFocus(program.thumbnailUrl)),
    getRelatedPrograms(id, program.category),
  ]);
  const siteUrl = getSiteUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "프로그램", item: `${siteUrl}/programs` },
      { "@type": "ListItem", position: 3, name: program.title, item: `${siteUrl}/programs/${program.id}` },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "프로그램", href: "/programs" },
          { label: program.title },
        ]}
      />

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-sm text-brand-green-primary mb-2">{getCategoryDisplayName(program.category)}</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 break-words">{program.title}</h1>
            {program.summary && (
              <p className="text-lg sm:text-xl text-gray-600 mb-6 break-words">{program.summary}</p>
            )}
          </div>
          <div className="ml-4 flex items-center gap-2">
            <PrintQuoteButton programId={program.id} />
            <ShareButton
              url={`/programs/${program.id}`}
              title={program.title}
              description={program.summary || undefined}
              imageUrl={parsedThumbnail.imageUrl || undefined}
            />
          </div>
        </div>
      </div>

      {program.images.filter(img => !img.url.includes("via.placeholder.com") && img.url.startsWith("http")).length > 0 && (
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {program.images
              .filter(img => !img.url.includes("via.placeholder.com") && img.url.startsWith("http"))
              .map((image, index) => (
                <ProgramImage
                  key={image.id}
                  src={image.url}
                  alt={`${program.title} - 이미지 ${index + 1}`}
                  priority={index === 0}
                  index={index}
                />
              ))}
          </div>
        </div>
      )}

      {program.description && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">프로그램 소개</h2>
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none 
            prose-headings:text-text-dark prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-4
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-2
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-2
            prose-li:text-gray-700 prose-li:my-2 prose-li:leading-relaxed prose-li:marker:text-brand-green-primary
            prose-strong:text-text-dark prose-strong:font-semibold
            prose-a:text-brand-green-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-brand-green-primary prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="my-2 leading-relaxed text-gray-700" {...props} />,
              }}
            >
              {preprocessMarkdown(program.description)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {program.schedules.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">일정표</h2>
          <div className="space-y-4">
            {program.schedules.map((schedule) => (
              <div key={schedule.id} className="border-l-4 border-brand-green-primary pl-4 py-2">
                <div className="font-semibold mb-1">{schedule.day}일차</div>
                <p className="text-gray-700 whitespace-pre-line">
                  {schedule.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-8 border-t">
        <Button asChild size="lg">
          <Link href="/inquiry">이 프로그램 문의하기</Link>
        </Button>
      </div>

      {relatedPrograms.length > 0 && (
        <div className="mt-12 pt-10 border-t border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-text-dark">
              {relatedSameCategory ? "같은 카테고리 다른 프로그램" : "다른 프로그램"}
            </h2>
            <Link
              href={`/programs?category=${encodeURIComponent(program.category)}`}
              className="text-sm text-brand-green-primary hover:underline flex-shrink-0"
            >
              전체 보기
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <p className="text-sm font-semibold text-text-dark line-clamp-2 leading-snug">
                      {rel.title}
                    </p>
                    {rel.summary && (
                      <p className="text-xs text-text-gray line-clamp-2">{rel.summary}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ReviewSection
        programId={program.id}
        initialReviews={program.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          content: r.content,
          createdAt: r.createdAt.toISOString(),
          user: r.user,
        }))}
        programRating={program.rating}
        reviewCount={program.reviewCount}
      />
    </div>
  );
}

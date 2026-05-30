import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BRAND_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { CardNewsImageViewer } from "@/components/news/CardNewsImageViewer";
import { MessageCircle, ArrowRight } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 해시태그에서 목적지 선택지 값을 추출 */
const HASHTAG_DESTINATION_MAP: Record<string, string> = {
  "#인천": "인천",
  "#서울": "서울/경기",
  "#포천": "서울/경기",
  "#가평": "서울/경기",
  "#충남": "충청",
  "#전라": "전라",
  "#경상": "경상",
  "#제주": "제주",
  "#일본": "일본",
  "#동남아": "동남아시아",
  "#해외": "기타 해외",
};

/** 카테고리에서 학교급을 추출 */
const CATEGORY_SCHOOL_LEVEL_MAP: Record<string, string> = {
  "특성화고 프로그램": "특성화고",
  "국내 수학여행": "",
  "국내외 교육여행": "",
  "체험학습": "",
  "수련활동": "",
  "교사 연수": "",
  "해외 취업 및 유학": "",
  "지자체 및 대학 RISE 사업": "대학교/기관",
};

function buildInquiryUrl(news: {
  title: string;
  category: string | null;
  hashtags: string[];
}): string {
  const params = new URLSearchParams();
  params.set("programRef", news.title);

  // 해시태그에서 목적지 추출 (첫 번째 매칭)
  for (const tag of news.hashtags) {
    const dest = HASHTAG_DESTINATION_MAP[tag];
    if (dest) { params.set("destination", dest); break; }
  }

  // 카테고리에서 학교급 추출
  if (news.category) {
    const level = CATEGORY_SCHOOL_LEVEL_MAP[news.category];
    if (level) params.set("schoolLevel", level);
    params.set("purpose", news.category);
  }

  return `/inquiry?${params.toString()}`;
}

/** 구체적인 프로그램 카드뉴스인지 판별 (추상적인 기타 프로그램 제외) */
function isConcreteProgram(category: string | null): boolean {
  return !!category && category !== "기타 프로그램";
}

async function getNews(id: string) {
  return await prisma.companyNews.findUnique({
    where: { id },
  });
}

async function getNewsSeoData(id: string) {
  return await prisma.companyNews.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      summary: true,
      createdAt: true,
      isPinned: true,
      imageUrl: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const news = await getNewsSeoData(id);

  if (!news) {
    return {
      title: "회사 소식 | 터치더월드",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    news.summary ||
    `${format(new Date(news.createdAt), "yyyy년 MM월 dd일")} 게시된 터치더월드 소식입니다.`;

  return {
    title: `${news.title} | 터치더월드`,
    description,
    keywords: mergeKeywords(BRAND_KEYWORDS, ["회사 소식", "공지", news.title]),
    alternates: {
      canonical: `/news/${news.id}`,
    },
    openGraph: {
      title: `${news.title} | 터치더월드`,
      description,
      url: `/news/${news.id}`,
      type: "article",
      images: news.imageUrl ? [{ url: news.imageUrl }] : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews(id);

  if (!news) {
    notFound();
  }
  const cardNewsImages =
    news.imageUrls.length > 0
      ? news.imageUrls
      : news.imageUrl
        ? [news.imageUrl]
        : [];

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/news/${news.id}`;
  const description =
    news.summary ||
    `${format(new Date(news.createdAt), "yyyy년 MM월 dd일")} 게시된 터치더월드 소식입니다.`;

  // 카드뉴스 타입에 맞는 JSON-LD 구조화 데이터
  const jsonLd =
    news.type === "PROGRAM_CARD_NEWS"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: news.title,
          description,
          datePublished: news.createdAt.toISOString(),
          dateModified: news.updatedAt.toISOString(),
          url: pageUrl,
          publisher: {
            "@type": "Organization",
            name: "터치더월드",
            url: siteUrl,
          },
          ...(cardNewsImages.length > 0 && {
            image: cardNewsImages.map((url) => ({
              "@type": "ImageObject",
              url: url.startsWith("http") ? url : `${siteUrl}${url}`,
              caption: news.title,
            })),
          }),
          keywords: [
            ...(news.category ? [news.category] : []),
            ...news.hashtags,
            "교육여행", "터치더월드",
          ].join(", "),
        }
      : {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: news.title,
          description,
          datePublished: news.createdAt.toISOString(),
          dateModified: news.updatedAt.toISOString(),
          url: pageUrl,
          publisher: {
            "@type": "Organization",
            name: "터치더월드",
            url: siteUrl,
          },
          ...(news.imageUrl && {
            image: `${news.imageUrl.startsWith("http") ? "" : siteUrl}${news.imageUrl}`,
          }),
        };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { label: "회사 소식", href: "/news" },
            { label: news.title },
          ]}
        />

        <article className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 mt-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {news.isPinned && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-brand-green-primary text-white">
                공지
              </span>
            )}
            <time
              dateTime={news.createdAt.toISOString()}
              className="text-sm text-text-gray"
            >
              {format(new Date(news.createdAt), "yyyy년 MM월 dd일")}
            </time>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-dark mb-6">
            {news.title}
          </h1>

          {news.summary && (
            <p className="text-lg text-text-gray mb-6 leading-relaxed">
              {news.summary}
            </p>
          )}

          {cardNewsImages.length > 0 && (
            <div className="mb-8">
              <CardNewsImageViewer images={cardNewsImages} title={news.title} />
            </div>
          )}

          {news.content && (
            <div className="prose prose-lg max-w-none mb-6 text-text-dark
              prose-headings:text-text-dark prose-headings:font-bold
              prose-h2:text-xl prose-h3:text-lg
              prose-strong:text-text-dark
              prose-a:text-brand-green-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:my-1
              prose-hr:border-gray-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {news.content}
              </ReactMarkdown>
            </div>
          )}

          {news.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {news.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-brand-green-primary/80 hover:text-brand-green-primary transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 빠른 문의 CTA — 구체적인 프로그램 카드뉴스에만 표시 */}
          {news.type === "PROGRAM_CARD_NEWS" && isConcreteProgram(news.category) && (
            <div className="mt-8 rounded-xl border border-brand-green-primary/25 bg-brand-green-primary/[0.05] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-brand-green-primary/15 p-2.5 mt-0.5">
                  <MessageCircle className="w-5 h-5 text-brand-green-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-dark leading-snug">
                    이 프로그램에 대해 문의하기
                  </p>
                  <p className="text-sm text-text-gray mt-1">
                    기본 정보가 미리 채워진 문의 화면으로 바로 이동합니다.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white gap-2 flex-shrink-0 w-full sm:w-auto"
              >
                <Link href={buildInquiryUrl(news)} className="flex items-center gap-2">
                  빠른 문의
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button asChild variant="outline">
              <Link href="/news">목록으로</Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}

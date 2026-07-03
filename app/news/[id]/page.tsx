import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { isRecentlyAdded, stripBrandFromTitle } from "@/lib/news-utils";
import { CompanyNewsType } from "@prisma/client";

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
  "국내 교육여행":     "",
  "국외 교육여행":     "",
  "체험학습":          "",
  "수련활동":          "",
  "교사 연수":         "",
  "일본 유학":         "",
  "기타 프로그램":     "",
  // 레거시
  "국내 수학여행":              "",
  "국내외 교육여행":            "",
  "해외 취업 및 유학":          "",
  "지자체 및 대학 RISE 사업":   "대학교/기관",
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

async function getRelatedCardNews(id: string, category: string | null, type: CompanyNewsType) {
  if (!category) return [];
  return await prisma.companyNews.findMany({
    where: { id: { not: id }, type, category },
    take: 4,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      summary: true,
      imageUrl: true,
      category: true,
      hashtags: true,
      createdAt: true,
      link: true,
    },
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

export const revalidate = 86400;

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

  const relatedNews = await getRelatedCardNews(id, news.category, news.type);
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

  const isCardNews = news.type === "PROGRAM_CARD_NEWS";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: isCardNews ? "프로그램 카드뉴스" : "회사 소식",
        item: `${siteUrl}${isCardNews ? "/news" : "/company-news"}`,
      },
      { "@type": "ListItem", position: 3, name: news.title, item: pageUrl },
    ],
  };

  // 카드뉴스 타입에 맞는 JSON-LD 구조화 데이터
  const jsonLd =
    isCardNews
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs
          items={[
            news.type === "PROGRAM_CARD_NEWS"
              ? { label: "프로그램 카드뉴스", href: "/news" }
              : { label: "회사 소식", href: "/company-news" },
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

          {/* 이미지 + 텍스트 2열 (데스크탑) */}
          <div className={cardNewsImages.length > 0 ? "lg:grid lg:grid-cols-[2fr_3fr] lg:gap-10 lg:items-start" : undefined}>
            {/* 왼쪽: 이미지 슬라이더 */}
            {cardNewsImages.length > 0 && (
              <div className="mb-6 lg:mb-0 lg:sticky lg:top-24">
                <CardNewsImageViewer
                  images={cardNewsImages}
                  title={news.title}
                  className="max-w-none"
                />
              </div>
            )}

            {/* 오른쪽: 요약·본문·태그·CTA */}
            <div>
              {news.summary && (
                <p className="text-lg text-text-gray mb-6 leading-relaxed">
                  {news.summary}
                </p>
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
              {isCardNews && isConcreteProgram(news.category) && (
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
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button asChild variant="outline">
              <Link href={news.type === "PROGRAM_CARD_NEWS" ? "/news" : "/company-news"}>
                목록으로
              </Link>
            </Button>
          </div>
        </article>

        {relatedNews.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-text-dark">
                같은 카테고리 다른 카드뉴스
              </h2>
              {news.category && (
                <Link
                  href={`/programs?category=${encodeURIComponent(news.category)}`}
                  className="text-sm text-brand-green-primary hover:underline flex-shrink-0"
                >
                  전체 보기
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedNews.map((item) => {
                const href = item.link?.trim() || `/news/${item.id}`;
                const isExternal = !!item.link?.trim()?.startsWith("http");
                const isNew = isRecentlyAdded(item.createdAt);
                const regionTag = item.hashtags.find((t) =>
                  ["#서울", "#인천", "#포천", "#가평", "#충남", "#일본", "#해외", "#국내"].includes(t)
                ) ?? null;
                const showTagRow = isNew || regionTag;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                  >
                    {showTagRow && (
                      <div className="px-3 pt-2.5 pb-0 flex flex-wrap items-center gap-1">
                        {isNew && (
                          <span className="rounded bg-brand-green-primary text-white px-2.5 py-0.5 text-xs font-bold">
                            NEW
                          </span>
                        )}
                        {regionTag && (
                          <span className="rounded-full bg-gray-100 text-text-gray px-2.5 py-0.5 text-xs">
                            {regionTag}
                          </span>
                        )}
                      </div>
                    )}
                    <div className={`relative aspect-[3/4] bg-gray-50 ${showTagRow ? "mt-2" : ""}`}>
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-contain group-hover:scale-[1.03] transition-transform duration-200"
                        />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="text-xs sm:text-sm font-medium text-text-dark line-clamp-2">
                        {stripBrandFromTitle(item.title)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

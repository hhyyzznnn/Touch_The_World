import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BRAND_KEYWORDS, mergeKeywords } from "@/lib/seo";
import Image from "next/image";

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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="mb-8 space-y-4">
              {cardNewsImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative mx-auto w-full max-w-2xl aspect-[4/5] rounded-lg overflow-hidden border bg-gray-100"
                >
                  <Image
                    src={url}
                    alt={`${news.title} 카드뉴스 ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 672px"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          )}

          {news.content && (
            <div className="prose prose-lg max-w-none mb-6">
              <div className="text-text-dark whitespace-pre-wrap leading-relaxed">
                {news.content}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button asChild variant="outline">
              <Link href="/news">목록으로</Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/Breadcrumbs";

async function getNews(id: string) {
  return await prisma.companyNews.findUnique({
    where: { id },
  });
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

          {news.content && (
            <div className="prose prose-lg max-w-none mb-6">
              <div className="text-text-dark whitespace-pre-wrap leading-relaxed">
                {news.content}
              </div>
            </div>
          )}

          {news.link?.trim() && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button asChild>
                <a
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  관련 링크 보기 →
                </a>
              </Button>
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

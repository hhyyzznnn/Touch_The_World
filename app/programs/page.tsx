import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { Pagination } from "@/components/Pagination";
import { ChevronRight } from "lucide-react";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "프로그램 카드뉴스 | 터치더월드",
  description:
    "터치더월드의 프로그램 가치와 인사이트를 카드뉴스 형태로 확인하세요. 세부 일정과 견적은 상담 후 맞춤 제안합니다.",
  keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS, ["카드뉴스", "프로그램 인사이트"]),
  alternates: {
    canonical: "/programs",
  },
};

const ITEMS_PER_PAGE = 12;

async function getProgramCardNews(page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [items, total] = await Promise.all([
    prisma.companyNews.findMany({
      where: {
        imageUrl: {
          not: null,
        },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        summary: true,
        imageUrl: true,
        createdAt: true,
        isPinned: true,
      },
    }),
    prisma.companyNews.count({
      where: {
        imageUrl: {
          not: null,
        },
      },
    }),
  ]);

  return {
    items,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
  };
}

// 페이지 재검증 시간 설정 (10분)
export const revalidate = 600;

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const { items, totalPages } = await getProgramCardNews(currentPage);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">프로그램 카드뉴스</h1>
        <p className="text-sm sm:text-base text-text-gray leading-relaxed max-w-3xl">
          가격표형 상품 대신, 교육 목표와 운영 철학을 담은 카드뉴스를 먼저 소개합니다.
          구체적인 일정·견적은 상담 후 기관별 맞춤형으로 안내드립니다.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-text-gray rounded-xl border border-dashed border-gray-300 bg-gray-50">
          등록된 카드뉴스가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((item) => {
              return (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/5] bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    ) : null}
                    {item.isPinned && (
                      <span className="absolute top-2 left-2 inline-flex items-center rounded bg-brand-green-primary px-2 py-0.5 text-xs font-bold text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-sm sm:text-base font-medium text-text-dark line-clamp-2">{item.title}</p>
                    {item.summary && (
                      <p className="mt-1 text-xs sm:text-sm text-text-gray line-clamp-2">{item.summary}</p>
                    )}
                    <div className="mt-2 inline-flex items-center text-xs text-brand-green font-medium">
                      자세히 보기
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/programs"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}

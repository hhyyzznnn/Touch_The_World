import { unstable_cache } from "next/cache";
import { CompanyNewsType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAudiences } from "@/lib/news-audience";

/**
 * 추천용 프로그램 카드뉴스 목록 (글 하단 "함께 보면 좋은 프로그램"·추천 카드 API가 함께 쓴다).
 * 대상 학교급은 본문까지 보고 판정하고(lib/news-audience.ts), 본문 자체는 넘기지 않는다.
 * 고르는 필드를 바꾸면 캐시 키 버전도 올릴 것 — 예전 캐시 결과가 배포 후에도 남는다.
 */
async function loadProgramCatalog() {
  const rows = await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.PROGRAM_CARD_NEWS },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      link: true,
      categories: true,
      hashtags: true,
      seasons: true,
      endDate: true,
      createdAt: true,
      content: true,
      summary: true,
    },
  });
  return rows.map(({ content, summary, ...r }) => ({
    ...r,
    seasons: r.seasons ?? [],
    audiences: getAudiences({ hashtags: r.hashtags, content, summary }),
  }));
}

export type ProgramCatalogItem = Awaited<ReturnType<typeof loadProgramCatalog>>[number];

export const getProgramCatalog = unstable_cache(loadProgramCatalog, ["program-catalog-v1"], { revalidate: 600 });

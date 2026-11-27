import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildCostTable, type CostTable } from "@/lib/trip-cost";

export interface CostReport {
  table: CostTable;
  /** 집계에 쓴 공고 수집 기간 (YYYY-MM-DD, 한국 시간) */
  from: string | null;
  to: string | null;
}

const kstDate = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

/** 최근 1년 학교 입찰 공고로 예상 비용표를 만든다 — 하루 한 번만 다시 계산 */
async function loadCostReport(): Promise<CostReport> {
  const since = new Date(Date.now() - 365 * 86_400_000);
  const rows = await prisma.g2BNotice.findMany({
    where: { createdAt: { gte: since }, aiSummary: { not: { equals: null } } },
    select: { title: true, aiSummary: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return {
    table: buildCostTable(rows),
    from: rows.length ? kstDate(rows[0].createdAt) : null,
    to: rows.length ? kstDate(rows[rows.length - 1].createdAt) : null,
  };
}

export const getCostReport = unstable_cache(loadCostReport, ["trip-cost-report-v1"], { revalidate: 86_400 });

/** 문의 페이지 '예상 비용 먼저 보기'용 */
export async function getCostTable(): Promise<CostTable> {
  return (await getCostReport()).table;
}

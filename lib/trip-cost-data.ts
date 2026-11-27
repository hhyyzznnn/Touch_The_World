import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildCostTable, type CostTable } from "@/lib/trip-cost";

/** 최근 1년 학교 입찰 공고로 예상 비용표를 만든다 — 하루 한 번만 다시 계산 */
async function loadCostTable(): Promise<CostTable> {
  const since = new Date(Date.now() - 365 * 86_400_000);
  const rows = await prisma.g2BNotice.findMany({
    where: { createdAt: { gte: since }, aiSummary: { not: { equals: null } } },
    select: { title: true, aiSummary: true },
  });
  return buildCostTable(rows);
}

export const getCostTable = unstable_cache(loadCostTable, ["trip-cost-table-v1"], { revalidate: 86_400 });

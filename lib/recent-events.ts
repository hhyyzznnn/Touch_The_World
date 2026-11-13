import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getEventThumbnailUrl } from "@/lib/event-utils";

export type RecentEvent = {
  id: string;
  schoolName: string;
  programTitle: string;
  location: string;
  date: string;
  endDate: string | null;
  imageUrl: string | null;
  isSummaryCard: boolean;
};

/** 최근 진행 행사 — 사진(요약 카드나 행사 사진)이 있는 것만, 최신순. 회사 소개 등 신뢰 근거로 보여 줄 때 쓴다. */
export const getRecentEvents = unstable_cache(
  async (limit: number): Promise<RecentEvent[]> => {
    const events = await prisma.event.findMany({
      where: { OR: [{ summaryCardUrl: { not: null } }, { images: { some: {} } }] },
      orderBy: { date: "desc" },
      take: limit,
      select: {
        id: true,
        date: true,
        endDate: true,
        location: true,
        summaryCardUrl: true,
        school: { select: { name: true } },
        program: { select: { title: true } },
        images: { select: { url: true }, take: 1, orderBy: { createdAt: "asc" } },
      },
    });
    return events.map((e) => ({
      id: e.id,
      schoolName: e.school.name,
      programTitle: e.program.title,
      location: e.location,
      date: e.date.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      imageUrl: getEventThumbnailUrl(e),
      isSummaryCard: !!e.summaryCardUrl,
    }));
  },
  ["recent-events-v1"],
  { revalidate: 3600 }
);

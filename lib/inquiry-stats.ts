import { classifyTouch, sanitizeAttribution, type Channel } from "./attribution";

/** 통계에 필요한 문의 필드만 */
export interface InquiryStatRow {
  createdAt: Date;
  sourceType: string;
  status: string;
  linkedEventId: string | null;
  purpose: string | null;
  schoolLevel: string | null;
  destination: string | null;
  attribution: unknown;
}

export interface Count {
  label: string;
  count: number;
}

const KST = "Asia/Seoul";
const monthKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: KST }).slice(0, 7);

function tally(values: (string | null | undefined)[], emptyLabel = "미입력"): Count[] {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = v?.trim() || emptyLabel;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

/** 최근 months개월(이번 달 포함), 문의가 없는 달도 0으로 채운다. */
export function monthlyCounts(rows: InquiryStatRow[], months: number, now = new Date()) {
  const keys: string[] = [];
  const cursor = new Date(now.toLocaleDateString("sv-SE", { timeZone: KST }).slice(0, 7) + "-01T00:00:00+09:00");
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - i);
    keys.push(monthKey(d));
  }
  return keys.map((month) => {
    const inMonth = rows.filter((r) => monthKey(r.createdAt) === month);
    return {
      month,
      form: inMonth.filter((r) => r.sourceType !== "ai_consulting").length,
      chatbot: inMonth.filter((r) => r.sourceType === "ai_consulting").length,
    };
  });
}

/** 랜딩 경로를 사람이 읽을 이름으로 — 카드뉴스는 ID, 쿼리는 버린다. */
export function landingLabel(landing: string): string {
  const path = landing.split("?")[0] || "/";
  if (path === "/") return "메인";
  return path;
}

export function buildInquiryStats(rows: InquiryStatRow[], now = new Date()) {
  const withAttribution = rows
    .map((r) => ({ row: r, attribution: sanitizeAttribution(r.attribution) }))
    .filter((r) => r.attribution);

  const firstChannels = withAttribution.map((r) => classifyTouch(r.attribution!.first ?? r.attribution!.last));
  const lastChannels = withAttribution.map((r) => classifyTouch(r.attribution!.last ?? r.attribution!.first));
  const landings = withAttribution.map((r) => landingLabel((r.attribution!.first ?? r.attribution!.last)!.landing));

  const progressed = rows.filter((r) => r.linkedEventId || r.status === "completed").length;

  return {
    total: rows.length,
    tracked: withAttribution.length,
    monthly: monthlyCounts(rows, 12, now),
    firstChannel: tally(firstChannels) as (Count & { label: Channel | string })[],
    lastChannel: tally(lastChannels),
    landing: tally(landings).slice(0, 10),
    purpose: tally(rows.map((r) => r.purpose)),
    schoolLevel: tally(rows.map((r) => r.schoolLevel)),
    destination: tally(rows.map((r) => r.destination)),
    status: tally(rows.map((r) => r.status)),
    linkedToEvent: rows.filter((r) => r.linkedEventId).length,
    progressed,
  };
}

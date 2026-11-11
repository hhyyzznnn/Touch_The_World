/**
 * 프로그램 추천 — 카드뉴스 상세 하단 "함께 보면 좋은 프로그램"과, 본 글 기록으로 띄우는 작은 추천 카드가 함께 쓴다.
 * 판단 기준은 이미 정리돼 있는 분야(categories)·지역 해시태그·대상 학교급(lib/news-audience.ts)·운영 시기(lib/news-seasons.ts).
 * 마감된 글은 추천하지 않는다. (순수 함수 — DB 조회는 lib/program-catalog.ts)
 */
import { HASHTAG_REGIONS } from "@/lib/news-constants";
import { isEnded } from "@/lib/news-utils";
import type { AudienceKey } from "@/lib/news-audience";

export interface RecItem {
  id: string;
  categories: string[];
  hashtags: string[];
  audiences: AudienceKey[];
  seasons: string[];
  endDate: Date | string | null;
  createdAt: Date | string;
}

const REGION_TAGS = new Set(HASHTAG_REGIONS.map((r) => `#${r}`));
const WEIGHT = { category: 3, region: 2, audience: 2, season: 1 } as const;

export const regionsOf = (item: Pick<RecItem, "hashtags">) => item.hashtags.filter((t) => REGION_TAGS.has(t));

type Facet = "category" | "region" | "audience" | "season";
const facetValues = (item: RecItem): [Facet, string][] => [
  ...item.categories.map((v) => ["category", v] as [Facet, string]),
  ...regionsOf(item).map((v) => ["region", v] as [Facet, string]),
  ...item.audiences.map((v) => ["audience", v] as [Facet, string]),
  ...item.seasons.map((v) => ["season", v] as [Facet, string]),
];

/** 기준 글(들)이 가진 분야·지역·대상·시기를 몇 번 갖고 있는지 센 관심 목록 */
function profileOf(items: RecItem[]): Map<string, number> {
  const p = new Map<string, number>();
  for (const it of items) for (const [f, v] of facetValues(it)) p.set(`${f}:${v}`, (p.get(`${f}:${v}`) ?? 0) + 1);
  return p;
}

function score(profile: Map<string, number>, item: RecItem): number {
  let s = 0;
  for (const [f, v] of facetValues(item)) {
    const n = profile.get(`${f}:${v}`);
    if (n) s += WEIGHT[f] * Math.min(n, 3);
  }
  return s;
}

const newestFirst = (a: RecItem, b: RecItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** 지금 보는 글과 분야·지역·대상·시기가 많이 겹치는 순으로 (마감·자기 자신 제외). 분야가 하나도 안 겹치면 넣지 않는다 */
export function pickRelated<T extends RecItem>(current: RecItem, all: T[], n = 4): T[] {
  const profile = profileOf([current]);
  return all
    .filter((it) => it.id !== current.id && !isEnded(it.endDate ? new Date(it.endDate) : null))
    .filter((it) => it.categories.some((c) => current.categories.includes(c)) || regionsOf(it).some((r) => regionsOf(current).includes(r)))
    .map((it) => ({ it, s: score(profile, it) }))
    .sort((a, b) => b.s - a.s || newestFirst(a.it, b.it))
    .slice(0, n)
    .map((x) => x.it);
}

/**
 * 본 글 기록으로 추천 1건. 같은 분야나 같은 지역 글을 2개 이상 봤을 때만 추천한다(관심이 드러났을 때만).
 * 이미 본 글·마감 글은 빼고, 점수가 낮으면(분야+지역 정도도 안 겹치면) 추천하지 않는다.
 */
export function recommendFromHistory<T extends RecItem>(
  viewed: RecItem[],
  all: T[],
): { item: T; reason: string } | null {
  if (viewed.length < 2) return null;
  const counts = new Map<string, number>();
  for (const it of viewed) for (const k of new Set([...it.categories.map((c) => `category:${c}`), ...regionsOf(it).map((r) => `region:${r}`)])) counts.set(k, (counts.get(k) ?? 0) + 1);
  const shared = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]);
  if (shared.length === 0) return null;

  const seen = new Set(viewed.map((v) => v.id));
  const profile = profileOf(viewed);
  const ranked = all
    .filter((it) => !seen.has(it.id) && !isEnded(it.endDate ? new Date(it.endDate) : null))
    .map((it) => ({ it, s: score(profile, it) }))
    .filter((x) => x.s >= WEIGHT.category * 2)
    .sort((a, b) => b.s - a.s || newestFirst(a.it, b.it));
  if (ranked.length === 0) return null;

  // "인천 · 교직원 연수·혜택" 처럼, 많이 본 지역·분야를 사람이 읽는 말로
  const region = shared.find(([k]) => k.startsWith("region:"))?.[0].slice(8).replace("#", "");
  const category = shared.find(([k]) => k.startsWith("category:"))?.[0].slice(9);
  const reason = [region, category].filter(Boolean).join(" · ");
  return { item: ranked[0].it, reason };
}

/**
 * 예상 비용 바로 보기 (2026-11-27) — 학교 입찰 공고(G2BNotice.aiSummary)의 1인당 금액으로 목적지·기간별 범위를 낸다.
 * 선생님이 문의 전 가장 궁금한 "얼마 드는지"를 먼저 보여 주고, 그 조건으로 바로 견적 문의로 잇기 위함.
 * 순수 함수만 두고, DB 조회·캐시는 lib/trip-cost-data.ts.
 */

export const TRIP_DESTINATIONS = ["제주", "국내", "수련활동", "일본", "해외"] as const;
export type TripDestination = (typeof TRIP_DESTINATIONS)[number];

export const TRIP_LENGTHS = [
  { key: 0, label: "당일" },
  { key: 1, label: "1박 2일" },
  { key: 2, label: "2박 3일" },
  { key: 3, label: "3박 이상" },
] as const;

/** 문의 양식의 '여행 지역' 값으로 옮길 때 (국내·수련활동은 지역이 정해지지 않아 비워 둔다) */
export const DESTINATION_TO_FORM: Record<TripDestination, string> = {
  제주: "제주",
  국내: "",
  수련활동: "",
  일본: "일본",
  해외: "기타 해외",
};

const MIN_SAMPLES = 5;

export function classifyDestination(text: string): TripDestination {
  if (text.includes("제주")) return "제주";
  if (/일본|오사카|후쿠오카|도쿄|동경|규슈|교토|히로시마/.test(text)) return "일본";
  if (/국외|해외|미국|싱가포르|베트남|대만|중국|유럽|호주|캐나다|필리핀|태국|뉴질랜드/.test(text)) return "해외";
  if (text.includes("수련")) return "수련활동";
  return "국내";
}

/** "약 733,079원", "723,000원 정도", "약 ￦313,000원" → 숫자. 총액("/총인원")이나 말이 안 되는 값은 버린다 */
export function parsePerPerson(text: unknown): number | null {
  if (typeof text !== "string" || /\/\s*총/.test(text)) return null;
  const m = text.replace(/[\\￦₩금]/g, "").match(/(\d[\d,]*)\s*원/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return n >= 50_000 && n <= 10_000_000 ? n : null;
}

/** "2박 3일" 또는 날짜 범위 "2027. 4. 5.(월) ~ 2027. 4. 7.(수)" → 박 수 (당일 0). 모르면 null */
export function parseNights(text: unknown): number | null {
  if (typeof text !== "string" || !text.trim()) return null;
  const n = text.match(/(\d+)\s*박/);
  if (n) return Number(n[1]);
  if (/당일|1일간|\(1일\)/.test(text)) return 0;
  const dates = [...text.matchAll(/(?:(\d{4})\s*[.년]\s*)?(\d{1,2})\s*[.월]\s*(\d{1,2})\s*(?:[.일]|\()/g)];
  if (dates.length < 2) return null;
  const toDate = (d: RegExpMatchArray, fallbackYear: number) =>
    new Date(Date.UTC(Number(d[1] ?? fallbackYear), Number(d[2]) - 1, Number(d[3])));
  const first = dates[0];
  const year = Number(first[1] ?? 2000);
  const nights = Math.round((toDate(dates[dates.length - 1], year).getTime() - toDate(first, year).getTime()) / 86_400_000);
  return nights >= 0 && nights <= 30 ? nights : null;
}

const lengthBucket = (nights: number) => Math.min(nights, 3);

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
}

export interface CostRange {
  low: number; // 하위 25%
  mid: number; // 중간값
  high: number; // 상위 25%
  count: number;
}

export interface CostTable {
  /** 목적지 → 기간(박 수 0~3, 3은 3박 이상) → 범위. 표본이 5건 미만인 칸은 없다 */
  byLength: Partial<Record<TripDestination, Partial<Record<number, CostRange>>>>;
  /** 기간을 고르지 않았거나 그 기간 표본이 적을 때 쓰는 목적지 전체 범위 */
  overall: Partial<Record<TripDestination, CostRange>>;
  sampleSize: number;
}

const range = (values: number[]): CostRange => {
  const s = [...values].sort((a, b) => a - b);
  return { low: quantile(s, 0.25), mid: quantile(s, 0.5), high: quantile(s, 0.75), count: s.length };
};

export function buildCostTable(rows: { title: string; aiSummary: unknown }[]): CostTable {
  const samples: { dest: TripDestination; nights: number | null; per: number }[] = [];
  for (const r of rows) {
    const a = (r.aiSummary && typeof r.aiSummary === "object" ? r.aiSummary : {}) as Record<string, unknown>;
    const per = parsePerPerson(a["1인당"]);
    if (per === null) continue;
    samples.push({ dest: classifyDestination(`${r.title} ${a["장소"] ?? ""}`), nights: parseNights(a["기간"]), per });
  }
  const table: CostTable = { byLength: {}, overall: {}, sampleSize: samples.length };
  for (const dest of TRIP_DESTINATIONS) {
    const mine = samples.filter((s) => s.dest === dest);
    if (mine.length >= MIN_SAMPLES) table.overall[dest] = range(mine.map((s) => s.per));
    for (const { key } of TRIP_LENGTHS) {
      const inLen = mine.filter((s) => s.nights !== null && lengthBucket(s.nights) === key).map((s) => s.per);
      if (inLen.length >= MIN_SAMPLES) (table.byLength[dest] ??= {})[key] = range(inLen);
    }
  }
  return table;
}

/** 만 원 단위 반올림 표기: 733,079 → "73만" */
export const manwon = (n: number) => `${Math.round(n / 10_000).toLocaleString("ko-KR")}만`;

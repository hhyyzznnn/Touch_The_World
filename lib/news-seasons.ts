/**
 * 프로그램 탭 "언제 가시나요" — 카드뉴스 운영 시기(학사 일정 기준, 2026-11-10 사용자 결정).
 * CompanyNews.seasons에 아래 key를 저장한다. 비어 있으면 "연중"(시기와 관계없이 운영)으로 본다.
 * 본문에 시기가 적혀 있거나 실제로 다녀온 시기가 있는 글만 표시하고, 근거 없이 추정해 넣지 않는다.
 */

export const SEASONS = [
  { key: "1학기", label: "1학기", hint: "3~7월", months: [3, 4, 5, 6, 7] },
  { key: "여름방학", label: "여름방학", hint: "7~8월", months: [7, 8] },
  { key: "2학기", label: "2학기", hint: "9~12월", months: [9, 10, 11, 12] },
  { key: "수능이후", label: "수능 이후", hint: "11~12월", months: [11, 12] },
  { key: "겨울방학", label: "겨울방학", hint: "1~2월", months: [1, 2] },
] as const;

export type SeasonKey = (typeof SEASONS)[number]["key"];

const SEASON_KEYS = SEASONS.map((s) => s.key) as readonly string[];

export function isSeasonKey(value: unknown): value is SeasonKey {
  return typeof value === "string" && SEASON_KEYS.includes(value);
}

/** 저장 전 정리: 정해진 key만 남기고 순서를 SEASONS 순으로 맞춘다 */
export function normalizeSeasons(values: unknown): SeasonKey[] {
  const list = Array.isArray(values) ? values : typeof values === "string" ? values.split(/[,\n]/) : [];
  const set = new Set(list.map((v) => String(v).trim()));
  return SEASONS.map((s) => s.key).filter((k) => set.has(k));
}

export function seasonLabel(key: SeasonKey): string {
  return SEASONS.find((s) => s.key === key)!.label;
}

/** 지금(한국 시간) 해당하는 시기 — 고르기 칸에 "지금" 표시용 */
export function currentSeasonKeys(now: Date = new Date()): SeasonKey[] {
  const month = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "numeric" }).format(now));
  return SEASONS.filter((s) => (s.months as readonly number[]).includes(month)).map((s) => s.key);
}

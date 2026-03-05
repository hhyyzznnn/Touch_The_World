export const BRAND_KEYWORDS = [
  "터치더월드",
  "touchtheworld",
  "Touch The World",
];

export const CORE_TRAVEL_KEYWORDS = [
  "교육여행",
  "수학여행",
  "체험학습",
  "교사연수",
  "해외연수",
  "학생여행",
  "청소년여행",
  "여행",
  "여행사",
];

export const B2B_KEYWORDS = [
  "학교여행",
  "학교 프로그램",
  "지자체 연수",
  "공공기관 연수",
  "맞춤형 교육여행",
  "교육 프로그램",
];

export function mergeKeywords(...groups: ReadonlyArray<ReadonlyArray<string>>): string[] {
  const normalized = groups.flat().map((keyword) => keyword.trim()).filter(Boolean);
  return Array.from(new Set(normalized));
}


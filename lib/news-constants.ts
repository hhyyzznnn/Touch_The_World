export const PROGRAM_CATEGORIES = [
  "국내 교육여행",
  "국외 교육여행",
  "체험학습",
  "수련활동",
  "교사 연수",
  "일본 유학",
  "특성화고 프로그램",
  "기타 프로그램",
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

/**
 * 카드뉴스 해시태그 고정 목록.
 * PROGRAM_CATEGORIES(카테고리 8개 분류)와는 별도로, 지역·대상을 보충하는 용도.
 * AI/사람이 매번 다른 표현(#국내교육여행 vs #국내 교육여행 vs #국내외 등)을 즉석에서 만들어내면
 * 태그가 무한히 갈라지므로, 반드시 이 목록 안에서만 골라 쓴다.
 * 카드뉴스 1건당 보통 지역 1개 + 대상 1~2개, 총 3개 안팎을 사용한다.
 */
export const HASHTAG_REGIONS = [
  "서울", "인천", "포천", "가평", "충남",   // 국내 세부 지역 (해당 시)
  "일본", "유럽", "미국", "동남아시아", "해외", // 해외는 위 국가/대륙에 안 맞는 경우의 대체용
] as const;

export const HASHTAG_TARGETS = [
  "학생", "교사", "교직원", "학부모",       // 대상(역할)
  "초등", "중등", "고등", "특성화고",       // 대상(학교급)
] as const;

export const HASHTAG_POOL = [...HASHTAG_REGIONS, ...HASHTAG_TARGETS, "터치더월드"] as const;

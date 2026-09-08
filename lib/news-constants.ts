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
 * 카테고리별 배지 색상. 카드뉴스 그리드에서 8개 카테고리가 전부 같은 초록색 배지로 보여
 * 한눈에 구분이 안 되던 문제를 해결하기 위해 카테고리마다 다른 색을 지정한다.
 * (브랜드 그린은 "선택됨" 상태·CTA 버튼 전용으로 남겨두기 위해 카테고리 색상에서는 제외)
 * Tailwind는 클래스명을 정적으로 스캔하므로 문자열을 조합하지 않고 완성된 클래스명을 그대로 적어야 한다.
 */
export const CATEGORY_COLORS: Record<ProgramCategory, string> = {
  "국내 교육여행": "bg-blue-100 text-blue-700",
  "국외 교육여행": "bg-violet-100 text-violet-700",
  "체험학습": "bg-amber-100 text-amber-700",
  "수련활동": "bg-teal-100 text-teal-700",
  "교사 연수": "bg-rose-100 text-rose-700",
  "일본 유학": "bg-sky-100 text-sky-700",
  "특성화고 프로그램": "bg-orange-100 text-orange-700",
  "기타 프로그램": "bg-slate-100 text-slate-600",
};

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

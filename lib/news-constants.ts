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
 *
 * 무지개색 대신 브랜드 그린(#2E6D45)에서 회색으로 짙게 이어지는 그라데이션 한 벌로 구성 —
 * 대표 프로그램(국내 교육여행)이 가장 짙은 그린, "기타 프로그램"이 가장 중립적인 그레이가
 * 되도록 순서대로 배치했다. 전부 흰 글자를 올릴 수 있을 만큼 어두운 톤으로 골라서
 * (연한 -100 계열 배경은 흰 바탕 카드 위에서 색이 거의 안 보이는 문제가 있었음),
 * 배지 자체가 옅어져 안 보이는 일이 없게 했다.
 * 색상값이 Tailwind 기본 팔레트에 없어 임의값(bg-[#RRGGBB]) 문법을 쓰는데,
 * 클래스명을 조합하지 않고 완성된 문자열 그대로 둬야 Tailwind가 정적으로 스캔해 인식한다.
 */
export const CATEGORY_COLORS: Record<ProgramCategory, string> = {
  "국내 교육여행": "bg-[#1B4332] text-white",
  "국외 교육여행": "bg-[#2E6D45] text-white",
  "체험학습": "bg-[#3D8361] text-white",
  "수련활동": "bg-[#4A7A5C] text-white",
  "교사 연수": "bg-[#5C7A68] text-white",
  "일본 유학": "bg-[#6B7A72] text-white",
  "특성화고 프로그램": "bg-[#6E7673] text-white",
  "기타 프로그램": "bg-[#64748B] text-white",
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

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

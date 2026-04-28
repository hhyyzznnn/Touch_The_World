export const PROGRAM_CATEGORIES = [
  "국내 수학여행",
  "국내외 교육여행",
  "체험학습",
  "수련활동",
  "교사 연수",
  "해외 취업 및 유학",
  "지자체 및 대학 RISE 사업",
  "특성화고 프로그램",
  "기타 프로그램",
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

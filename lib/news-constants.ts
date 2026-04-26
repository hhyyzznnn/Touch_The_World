export const PROGRAM_CATEGORIES = [
  "국내수학여행",
  "국내외교육여행",
  "체험학습",
  "수련활동",
  "교사연수",
  "해외취업및유학",
  "지자체및대학RISE사업",
  "특성화고교프로그램",
  "기타프로그램",
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

/**
 * 문의가 들어온 경로 (Inquiry.sourceType). 2026-11-27: 전화·카톡 문의도 관리자가 기록해 채널별로 함께 센다.
 * 홈페이지 폼 제출만 세면 실제로는 전화·카톡으로 오는 학교 문의가 빠져 "문의 0건"처럼 보였다.
 */
export const INQUIRY_SOURCES = {
  manual: "홈페이지 문의",
  callback: "전화 요청(홈페이지)",
  ai_consulting: "AI 상담",
  phone: "전화",
  kakao: "카카오톡",
  other: "기타(메일·소개 등)",
} as const;

export type InquirySource = keyof typeof INQUIRY_SOURCES;

/** 관리자가 직접 기록하는 채널 */
export const MANUAL_RECORD_SOURCES = ["phone", "kakao", "other"] as const satisfies readonly InquirySource[];

export const sourceLabel = (s: string | null | undefined) =>
  INQUIRY_SOURCES[(s ?? "manual") as InquirySource] ?? s ?? INQUIRY_SOURCES.manual;

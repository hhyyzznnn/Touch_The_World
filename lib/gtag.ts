declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export const GA_EVENTS = {
  INQUIRY_START: "inquiry_start",
  INQUIRY_SUBMIT: "inquiry_submit",
  // 필수 칸 누락 등으로 제출이 막힘 / 서버·네트워크 오류로 접수 실패
  INQUIRY_INVALID: "inquiry_invalid",
  INQUIRY_ERROR: "inquiry_error",
  // 연락 수단 클릭(kakao_contact_click·phone_click·email_click·phone_copy)은 GoogleAnalytics.tsx에서 사이트 전체에 자동 기록
  KAKAO_CONTACT_CLICK: "kakao_contact_click",
  PHONE_CLICK: "phone_click",
  CHAT_START: "chat_start",
  CATEGORY_CLICK: "category_click",
  CARD_NEWS_CLICK: "card_news_click",
  PROGRAM_VIEW: "program_view",
  // 프로그램 추천 효과 측정 (2026-11-11): 글 하단 "함께 보면 좋은 프로그램" 클릭, 본 글 기록 기반 추천 카드 노출·클릭·닫기
  RELATED_CLICK: "related_program_click",
  RECO_SHOWN: "program_reco_shown",
  RECO_CLICK: "program_reco_click",
  RECO_DISMISS: "program_reco_dismiss",
} as const;

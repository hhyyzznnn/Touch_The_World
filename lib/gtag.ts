declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 이벤트 + 같은 이름의 Clarity 이벤트 (2026-11-27).
 * Clarity에서 이벤트 이름으로 녹화를 걸러 볼 수 있어, 숫자로 이탈 지점을 찾고 영상으로 이유를 확인한다.
 * 자동화 브라우저는 GoogleAnalytics.tsx·MicrosoftClarity.tsx가 아예 불러오지 않으므로 여기서도 건너뛰어진다.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") window.gtag("event", eventName, params);
  if (typeof window.clarity === "function") window.clarity("event", eventName);
}

/** 페이지를 떠나는 순간에도 전송되도록 beacon으로 보내는 이벤트 (이탈 기록용) */
export function trackLeaveEvent(eventName: string, params?: Record<string, unknown>) {
  trackEvent(eventName, { ...params, transport_type: "beacon" });
}

/** Clarity 녹화에 태그를 붙인다 — 대시보드에서 "inquiry = abandoned" 같은 조건으로 녹화만 골라 볼 수 있다 */
export function clarityTag(key: string, value: string) {
  if (typeof window !== "undefined" && typeof window.clarity === "function") window.clarity("set", key, value);
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
  // 메인 첫 화면 "터치더월드가 하는 일" 6칸 클릭 (2026-11-17 A안)
  CARD_NEWS_CLICK: "card_news_click",
  PROGRAM_VIEW: "program_view",
  // 글 하단 "함께 보면 좋은 프로그램" 클릭 (2026-11-11)
  RELATED_CLICK: "related_program_click",
  // 문의 페이지 '예상 비용 먼저 보기'에서 "이 조건으로 견적 받기" (2026-11-27)
  COST_ESTIMATE_APPLY: "cost_estimate_apply",
  // 이탈 지점 기록 (2026-11-27): 문의 페이지로 가는 링크 클릭(위치), 카드뉴스 읽은 깊이, 양식에서 멈춘 칸
  COST_ESTIMATE_SELECT: "cost_estimate_select",
  INQUIRY_CTA_CLICK: "inquiry_cta_click",
  NEWS_SCROLL: "news_scroll",
  CARD_SLIDE_DEPTH: "card_slide_depth",
  INQUIRY_ABANDON: "inquiry_abandon",
} as const;

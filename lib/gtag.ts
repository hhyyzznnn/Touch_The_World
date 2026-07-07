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
  INQUIRY_SUBMIT: "inquiry_submit",
  KAKAO_CONTACT_CLICK: "kakao_contact_click",
  PHONE_CLICK: "phone_click",
  CHAT_START: "chat_start",
  CATEGORY_CLICK: "category_click",
  CARD_NEWS_CLICK: "card_news_click",
  PROGRAM_VIEW: "program_view",
} as const;

// 검색엔진·링크 미리보기 수집기·캡처/점검 자동화에는 팝업·추천 카드를 띄우지 않는다.
// 네이버·다음·카카오톡 앱 안 브라우저(실제 방문자)는 걸리지 않도록 봇 이름만 지정한다 (Yeti=네이버, Daumoa=다음).
const BOT_UA =
  /bot\b|bot\/|crawl|spider|slurp|facebookexternalhit|kakaotalk-scrap|yeti|daumoa|lighthouse|headlesschrome|pagespeed|embedly|google-inspectiontool/i;

export function isRealVisitor(): boolean {
  if (typeof navigator === "undefined") return false;
  return !navigator.webdriver && !BOT_UA.test(navigator.userAgent);
}

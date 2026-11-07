import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// 자동화 브라우저(캡처·점검용 Playwright/크롬 DevTools, 헤드리스 봇)는 navigator.webdriver가 true라
// 집계에서 뺀다 — 2026-11-03처럼 캡처 작업이 "직접 방문" 수십 건으로 잡혀 지표를 부풀리던 것 방지.
// gtag가 정의되지 않으면 lib/gtag.ts의 이벤트 전송도 자동으로 건너뛴다.
export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        if (!navigator.webdriver) {
          var s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
          document.head.appendChild(s);
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);};
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        }
      `}
    </Script>
  );
}

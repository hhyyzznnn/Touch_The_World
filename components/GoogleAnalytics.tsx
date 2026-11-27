import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// 자동화 브라우저(캡처·점검용 Playwright/크롬 DevTools, 헤드리스 봇)는 navigator.webdriver가 true라
// 집계에서 뺀다 — 2026-11-03처럼 캡처 작업이 "직접 방문" 수십 건으로 잡혀 지표를 부풀리던 것 방지.
// gtag가 정의되지 않으면 lib/gtag.ts의 이벤트 전송도 자동으로 건너뛴다.
//
// 연락 수단 클릭은 버튼마다 따로 달지 않고 여기서 한 번에 기록한다 (2026-11-14).
// 사이트 어디에 있든 tel:·카카오 채널·mailto 링크를 누르면 phone_click / kakao_contact_click / email_click,
// 문의 페이지(/inquiry)로 가는 링크를 누르면 inquiry_cta_click(2026-11-27, 어떤 버튼으로 문의에 들어왔는지),
// 전화번호를 복사하면 phone_copy(PC에서는 tel: 링크 대신 번호를 복사해 거는 경우가 많다).
// place = 가장 가까운 data-contact-place 값, 없으면 header/footer/main, page = 현재 경로.
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
          // 문의 페이지 링크 — 템플릿 문자열 안이라 정규식 대신 문자열로 판정
          var isInquiryLink = function(h){
            var k = h.indexOf('touchtheworld.co.kr/inquiry');
            var rest = h.indexOf('/inquiry') === 0 ? h.slice(8) : k !== -1 ? h.slice(k + 27) : null;
            return rest !== null && (rest === '' || rest.charAt(0) === '?');
          };
          var place = function(el){
            var tagged = el.closest('[data-contact-place]');
            if (tagged) return tagged.getAttribute('data-contact-place');
            var area = el.closest('header, footer, main, aside, nav');
            return area ? area.tagName.toLowerCase() : 'other';
          };
          document.addEventListener('click', function(e){
            var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
            if (!a) return;
            var h = a.getAttribute('href') || '';
            var name = h.indexOf('tel:') === 0 ? 'phone_click'
              : h.indexOf('pf.kakao.com') !== -1 ? 'kakao_contact_click'
              : h.indexOf('mailto:') === 0 ? 'email_click'
              : isInquiryLink(h) ? 'inquiry_cta_click' : null;
            if (!name) return;
            var params = { place: place(a), page: location.pathname };
            if (name === 'inquiry_cta_click') params.with_program = h.indexOf('programRef=') !== -1 ? 'yes' : 'no';
            gtag('event', name, params);
            if (window.clarity) window.clarity('event', name);
          }, true);
          document.addEventListener('copy', function(){
            var t = String(window.getSelection() || '').replace(/[^0-9]/g, '');
            if (t.indexOf('18008078') !== -1) {
              var n = window.getSelection().anchorNode;
              gtag('event', 'phone_copy', { place: n && n.parentElement ? place(n.parentElement) : 'other', page: location.pathname });
            }
          });
        }
      `}
    </Script>
  );
}

import Script from "next/script";

// GA4와 나란히 쓰는 사용자 행동 분석(세션 녹화·히트맵·AI 요약).
// https://clarity.microsoft.com 에서 프로젝트 생성 후 발급되는 Project ID를
// NEXT_PUBLIC_CLARITY_ID로 설정하면 자동으로 로드된다 (설정 전에는 아무것도 하지 않음).
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export function MicrosoftClarity() {
  if (!CLARITY_ID) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}

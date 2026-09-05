"use client";

import Script from "next/script";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export function KakaoScript() {
  if (!KAKAO_JS_KEY) return null;

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && (window as unknown as { Kakao?: { init: (key: string) => void } }).Kakao) {
          (window as unknown as { Kakao: { init: (key: string) => void } }).Kakao.init(KAKAO_JS_KEY!);
        }
      }}
    />
  );
}

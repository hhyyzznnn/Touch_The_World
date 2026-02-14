"use client";

import Script from "next/script";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export function KakaoScript() {
  if (!KAKAO_JS_KEY) return null;

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_engine_sdk/3.0.9/sdk-v1.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && (window as unknown as { Kakao?: { init: (key: string) => void } }).Kakao) {
          (window as unknown as { Kakao: { init: (key: string) => void } }).Kakao.init(KAKAO_JS_KEY!);
        }
      }}
    />
  );
}

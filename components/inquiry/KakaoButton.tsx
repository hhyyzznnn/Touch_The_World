"use client";

import { useState } from "react";

interface KakaoButtonProps {
  phone: string;
}

export function KakaoButton({ phone }: KakaoButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await navigator.clipboard.writeText(phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // KakaoTalk 앱 실행 시도 (모바일)
    window.location.href = "kakaotalk://";
  };

  return (
    <button
      onClick={handleClick}
      title={copied ? "복사됨!" : "카카오톡 열기 + 전화번호 복사"}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-400 hover:bg-yellow-500 text-yellow-900 transition-colors"
    >
      {/* KakaoTalk 말풍선 아이콘 */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 3C6.477 3 2 6.82 2 11.5c0 2.99 1.742 5.63 4.38 7.22L5.5 21.5l3.18-1.66C9.5 20.26 10.73 20.5 12 20.5c5.523 0 10-3.82 10-8.5S17.523 3 12 3z"/>
      </svg>
      {copied ? "복사됨" : "카톡"}
    </button>
  );
}

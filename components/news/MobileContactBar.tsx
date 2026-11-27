"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Phone, MessageCircle, PencilLine } from "lucide-react";
import { telHref } from "@/lib/contact";

/**
 * 휴대폰 카드뉴스 화면 맨 아래 고정 문의 바 (2026-11-27).
 * 방문이 가장 많이 시작되는 곳이 카드뉴스인데, 문의 버튼은 긴 본문 끝에만 있어 대부분 보지 못하고 나갔다.
 * 전화·카톡 클릭은 GoogleAnalytics.tsx가 data-contact-place="news_sticky"로 기록한다.
 * 떠 있는 상담 버튼이 바를 가리지 않도록 body에 has-bottom-bar를 붙인다 (globals.css).
 */
export function MobileContactBar({ inquiryHref, kakaoUrl }: { inquiryHref: string; kakaoUrl: string | null }) {
  useEffect(() => {
    document.body.classList.add("has-bottom-bar");
    return () => document.body.classList.remove("has-bottom-bar");
  }, []);

  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium";
  return (
    <nav
      aria-label="문의하기"
      data-contact-place="news_sticky"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <a href={telHref()} className={`${item} text-text-dark`}>
        <Phone className="h-5 w-5 text-brand-green-primary" aria-hidden />
        전화 상담
      </a>
      {kakaoUrl && (
        <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className={`${item} text-text-dark`}>
          <MessageCircle className="h-5 w-5 text-brand-green-primary" aria-hidden />
          카카오톡
        </a>
      )}
      <Link href={inquiryHref} rel="nofollow" className={`${item} bg-brand-green-primary text-white`}>
        <PencilLine className="h-5 w-5" aria-hidden />
        견적 문의
      </Link>
    </nav>
  );
}

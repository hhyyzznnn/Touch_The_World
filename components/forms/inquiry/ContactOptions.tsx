import { Phone, MessageCircle, PencilLine } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { telHref } from "@/lib/contact";

/**
 * 문의 페이지 맨 위 — 전화·카카오톡·빠른 문의 중 편한 방법을 바로 고르게 한다 (2026-11-14).
 * Clarity 기록상 연락처만 확인하고 몇 초 만에 나가는 방문이 대부분이라, 폼보다 연락 수단을 먼저 보여 준다.
 * 클릭 기록은 GoogleAnalytics.tsx가 data-contact-place="inquiry_top"으로 남긴다.
 */
export function ContactOptions({ kakaoUrl, onQuickInquiry }: { kakaoUrl: string | null; onQuickInquiry: () => void }) {
  const card =
    "flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-3 text-center transition-colors hover:border-brand-green-primary/40 hover:bg-brand-green-primary/5";
  return (
    <div data-contact-place="inquiry_top" className="mb-8">
      <h1 className="text-3xl font-medium">문의하기</h1>
      <p className="mt-2 break-keep text-sm text-text-gray">
        편하신 방법으로 연락 주세요 · 평일 09:00~18:00
      </p>
      <div className={`mt-5 grid gap-2 sm:gap-3 ${kakaoUrl ? "grid-cols-3" : "grid-cols-2"}`}>
        <a href={telHref()} className={card}>
          <Phone className="h-5 w-5 text-brand-green-primary" aria-hidden />
          <span className="text-sm font-semibold text-text-dark">전화 상담</span>
          <span className="text-xs text-text-gray">{COMPANY_INFO.phone}</span>
        </a>
        {kakaoUrl && (
          <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className={card}>
            <MessageCircle className="h-5 w-5 text-brand-green-primary" aria-hidden />
            <span className="text-sm font-semibold text-text-dark">카카오톡</span>
            <span className="text-xs text-text-gray">채팅 상담</span>
          </a>
        )}
        <button type="button" onClick={onQuickInquiry} className={card}>
          <PencilLine className="h-5 w-5 text-brand-green-primary" aria-hidden />
          <span className="text-sm font-semibold text-text-dark">빠른 문의</span>
          <span className="text-xs text-text-gray">2분이면 끝나요</span>
        </button>
      </div>
    </div>
  );
}

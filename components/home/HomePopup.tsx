"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { isRealVisitor } from "@/lib/visitor";

interface HomePopupProps {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  link?: string | null;
}

/**
 * 메인 첫 방문 팝업 (2026-11-09 다시 도입).
 * 서버 HTML에는 넣지 않고, 실제 방문자의 브라우저에서만 띄운다 — 검색 결과·링크 미리보기·캡처에는 보이지 않는다.
 * 닫으면 아래 맨 위 한 줄 알림(HomeNoticeBar)이 같은 소식을 계속 보여 준다.
 */
export function HomePopup({ id, title, summary, imageUrl, link }: HomePopupProps) {
  const [open, setOpen] = useState(false);
  const storageKey = `home_popup_hidden_until_${id}`;

  useEffect(() => {
    if (!isRealVisitor()) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw && Date.now() < parseInt(raw, 10)) return;
    } catch {
      // 저장소를 못 쓰는 브라우저에서는 그냥 띄운다
    }
    const t = setTimeout(() => setOpen(true), 300);
    return () => clearTimeout(t);
  }, [storageKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const close = () => setOpen(false);
  const hideToday = () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    try {
      localStorage.setItem(storageKey, String(endOfDay.getTime()));
    } catch {
      // 무시 — 이번 화면에서만 닫힌다
    }
    setOpen(false);
  };

  const href = link?.trim() || `/news/${id}`;
  const isExternal = href.startsWith("http");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-2 right-2 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" aria-hidden />
        </button>

        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={close}
          className="block"
        >
          <div className="relative aspect-[2/3] max-h-[62vh] w-full bg-gray-100">
            <Image src={imageUrl} alt={title} fill sizes="384px" className="object-contain" />
          </div>
        </Link>

        <div className="px-5 pt-4 pb-2">
          <p className="text-sm font-bold text-text-dark leading-snug line-clamp-1 break-keep">{title}</p>
          {summary && <p className="mt-0.5 text-xs text-text-gray leading-relaxed line-clamp-2 break-keep">{summary}</p>}
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onClick={close}
            className="mt-3 flex items-center justify-center gap-1.5 w-full min-h-[44px] rounded-xl bg-brand-green-primary hover:bg-[#1B4332] text-white text-sm font-semibold transition-colors"
          >
            자세히 보기 <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="flex justify-center px-5 pb-4">
          <button onClick={hideToday} className="min-h-[44px] px-3 text-sm text-text-gray hover:text-text-dark transition-colors">
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}

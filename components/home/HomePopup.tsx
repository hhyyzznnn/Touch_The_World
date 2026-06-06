"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

interface HomePopupProps {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  link?: string | null;
}

const STORAGE_KEY = "home_popup_hidden_until";

export function HomePopup({ id, title, summary, imageUrl, link }: HomePopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && Date.now() < parseInt(raw)) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const close = () => setVisible(false);

  const hideToday = () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    localStorage.setItem(STORAGE_KEY, String(endOfDay.getTime()));
    setVisible(false);
  };

  if (!visible) return null;

  const href = link?.trim() || `/news/${id}`;
  const isExternal = href.startsWith("http");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 이미지 */}
        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={close}
          className="block"
        >
          <div className="relative aspect-[3/4] bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="384px"
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* 텍스트 + CTA */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-sm font-bold text-text-dark leading-snug line-clamp-1">{title}</p>
          {summary && (
            <p className="mt-0.5 text-xs text-text-gray leading-relaxed line-clamp-2">{summary}</p>
          )}
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onClick={close}
            className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl bg-brand-green-primary hover:bg-brand-green text-white text-sm font-semibold py-2.5 transition-colors"
          >
            자세히 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 하단 */}
        <div className="flex justify-center px-5 pt-2 pb-5">
          <button
            onClick={hideToday}
            className="text-xs text-text-gray/70 hover:text-text-gray transition-colors"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}

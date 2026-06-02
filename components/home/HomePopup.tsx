"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

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
    // 약간 딜레이 후 등장 (페이지 로드 직후 너무 급하지 않게)
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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
        >
          <div className="relative aspect-[3/4] bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="384px"
              className="object-cover"
              priority
            />
          </div>
        </Link>

        {/* 텍스트 */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-sm font-semibold text-text-dark line-clamp-1">{title}</p>
          <p className="text-xs text-text-gray mt-0.5 line-clamp-2 leading-relaxed">{summary}</p>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <button
            onClick={hideToday}
            className="text-xs text-text-gray hover:text-text-dark transition-colors"
          >
            오늘 하루 안 보기
          </button>
          <button
            onClick={close}
            className="text-xs font-medium text-brand-green-primary hover:underline"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

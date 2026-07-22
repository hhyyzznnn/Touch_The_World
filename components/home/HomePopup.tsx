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

export function HomePopup({ id, title, summary, imageUrl, link }: HomePopupProps) {
  // dismissed: "오늘 하루 보지 않기"로 완전히 숨김 (localStorage 확인 전까지는 false로 시작해
  //            이미지가 초기 렌더부터 존재하도록 함 — LCP 프리로드를 위해 중요)
  const [dismissed, setDismissed] = useState(false);
  // visible: 오버레이를 시각적으로 드러낼지 여부 (약간의 딜레이를 준 등장 애니메이션용).
  //          이미지 자체는 dismissed가 아닌 한 항상 DOM에 존재해 초기 로드부터 프리로드된다.
  const [visible, setVisible] = useState(false);
  const storageKey = `home_popup_hidden_until_${id}`;

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw && Date.now() < parseInt(raw)) {
      setDismissed(true);
      return;
    }
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, [id, storageKey]);

  const close = () => setVisible(false);

  const hideToday = () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    localStorage.setItem(storageKey, String(endOfDay.getTime()));
    setVisible(false);
  };

  if (dismissed) return null;

  const href = link?.trim() || `/news/${id}`;
  const isExternal = href.startsWith("http");

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={close}
      aria-hidden={!visible}
    >
      <div
        className={`relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden transition-transform duration-200 ${
          visible ? "translate-y-0" : "translate-y-4"
        }`}
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

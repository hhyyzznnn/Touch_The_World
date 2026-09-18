"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  title: string;
  className?: string;
}

export function CardNewsImageViewer({ images, title, className }: Props) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollTo = (index: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
    setCurrent(index);
  };

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrent(idx);
  };

  if (images.length === 1) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={images[0]}
        alt={title}
        className={`mx-auto block w-full rounded-xl border bg-gray-100 ${className ?? "max-w-md sm:max-w-lg"}`}
      />
    );
  }

  return (
    <div className={`relative select-none mx-auto ${className ?? "max-w-md sm:max-w-lg"}`}>
      {/* 슬라이더 */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory rounded-xl"
        // overflow-anchor: none — 슬라이드 크기가 고정돼 있지 않으면, 뒤쪽(지연 로딩) 이미지가
        // 나중에 로드되며 레이아웃이 흔들릴 때 브라우저가 스크롤 위치를 자기 멋대로 보정(스크롤
        // 앵커링)해서 카드뉴스가 중간 슬라이드부터 보이는 것처럼 튀는 문제가 있었음. 슬라이드마다
        // 고정 비율 박스(아래 aspect-[3/4])를 주고, 이 속성으로 브라우저의 자동 보정도 꺼버린다.
        style={{ scrollSnapType: "x mandatory", overflowAnchor: "none" }}
      >
        {images.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative w-full flex-shrink-0 snap-center aspect-[3/4] bg-gray-100"
            style={{ scrollSnapAlign: "center" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} ${i + 1}/${images.length}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* 이전/다음 버튼 (데스크탑) */}
      {current > 0 && (
        <button
          onClick={() => scrollTo(current - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/80 shadow hover:bg-white transition"
          aria-label="이전 이미지"
        >
          <ChevronLeft className="w-5 h-5 text-text-dark" />
        </button>
      )}
      {current < images.length - 1 && (
        <button
          onClick={() => scrollTo(current + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-white/80 shadow hover:bg-white transition"
          aria-label="다음 이미지"
        >
          <ChevronRight className="w-5 h-5 text-text-dark" />
        </button>
      )}

      {/* 페이지 인디케이터 */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`rounded-full transition-all duration-200 ${
              i === current
                ? "w-4 h-1.5 bg-brand-green-primary"
                : "w-1.5 h-1.5 bg-gray-300"
            }`}
            aria-label={`${i + 1}번째 이미지`}
          />
        ))}
        <span className="ml-2 text-xs text-text-gray">
          {current + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}

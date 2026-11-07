"use client";

import Link from "next/link";
import Image from "next/image";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";
import { CATEGORY_CARDS } from "@/lib/category-cards";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto">
      {CATEGORY_CARDS.map((card, index) => (
        <Link
          key={card.name}
          href={`/programs?category=${encodeURIComponent(card.name)}`}
          className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          onClick={() => trackEvent(GA_EVENTS.CATEGORY_CLICK, { category: card.name })}
        >
          {/* 상단 이미지 */}
          <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
            {card.image && (
              <Image
                src={card.image}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                quality={90}
                className="object-cover group-hover:scale-[1.07] transition-transform duration-500 ease-out"
                priority={index < 4}
              />
            )}
          </div>

          {/* 하단 텍스트 */}
          <div className="p-3 sm:p-4">
            {/* 배지 */}
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[13px] sm:text-sm font-semibold bg-brand-green-primary text-white mb-2">
              {card.name}
            </span>

            {/* 제목 */}
            <p className="text-sm sm:text-base font-bold text-text-dark leading-snug whitespace-pre-line mb-1.5">
              {card.title}
            </p>

            {/* 설명 */}
            <p className="text-[11px] sm:text-xs text-text-gray leading-relaxed line-clamp-2 break-keep">
              {card.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

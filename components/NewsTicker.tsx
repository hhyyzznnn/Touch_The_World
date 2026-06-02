"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  link: string | null;
  isPinned?: boolean;
}

type Phase = "show" | "exit" | "enter";

export function NewsTicker({ items }: { items: NewsItem[] }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("show");

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setPhase("exit");

      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setPhase("enter");
        setTimeout(() => setPhase("show"), 40);
      }, 320);
    }, 4500);

    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;

  const item = items[index];
  const href = item.link?.trim() || `/news/${item.id}`;
  const isExternal = href.startsWith("http");

  const style: React.CSSProperties =
    phase === "exit"
      ? { transform: "translateY(-10px)", opacity: 0, transition: "transform 0.3s ease, opacity 0.3s ease" }
      : phase === "enter"
      ? { transform: "translateY(10px)", opacity: 0, transition: "none" }
      : { transform: "translateY(0)", opacity: 1, transition: "transform 0.35s ease, opacity 0.35s ease" };

  return (
    <section className="bg-brand-green-primary/10 border-y border-brand-green-primary/20 overflow-hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-sm sm:text-base max-w-4xl mx-auto">
          {/* 좌측 레이블 */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-text-gray font-medium">회사 소식</span>
            <span className="text-gray-300" aria-hidden>|</span>
          </div>

          {/* 중앙 제목 */}
          <div className="flex justify-center overflow-hidden" style={style}>
            <Link
              href={href}
              className="inline-flex items-center gap-2 hover:underline underline-offset-2 min-w-0"
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
            >
              {item.isPinned && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-bold bg-brand-green-primary text-white shrink-0">
                  NEW
                </span>
              )}
              <span className="text-text-dark truncate">{item.title}</span>
            </Link>
          </div>

          {/* 우측 카운터 */}
          <div className="shrink-0 w-8 text-right">
            {items.length > 1 && (
              <span className="text-xs text-text-gray/60 tabular-nums">
                {index + 1}/{items.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

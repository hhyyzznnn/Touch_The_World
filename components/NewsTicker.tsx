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
        <div className="flex items-center justify-center gap-2 text-sm sm:text-base max-w-4xl mx-auto">
          <span className="text-text-gray font-medium shrink-0">회사 소식</span>
          <span className="text-gray-300 shrink-0" aria-hidden>|</span>

          <div className="flex-1 min-w-0" style={style}>
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
              <span className="text-text-dark max-w-[58vw] sm:max-w-2xl truncate">{item.title}</span>
            </Link>
          </div>

          {items.length > 1 && (
            <span className="text-xs text-text-gray/60 shrink-0 tabular-nums">
              {index + 1}/{items.length}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

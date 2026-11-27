"use client";

import { useEffect } from "react";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

/**
 * 카드뉴스 상세를 어디까지 읽었는지 (2026-11-27) — 글 본문(article) 기준 25·50·75·100% 지점을 지날 때 한 번씩
 * news_scroll { percent, page }. GA4 기본 스크롤은 90%만 남아 "어디서 그만 읽는지"를 알 수 없었다.
 */
export function NewsReadTracker() {
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    const sent = new Set<number>();
    const check = () => {
      const rect = article.getBoundingClientRect();
      const read = (window.innerHeight - rect.top) / Math.max(1, rect.height);
      for (const p of [25, 50, 75, 100]) {
        if (!sent.has(p) && read >= p / 100) {
          sent.add(p);
          trackEvent(GA_EVENTS.NEWS_SCROLL, { percent: p, page: location.pathname });
        }
      }
      if (sent.size === 4) window.removeEventListener("scroll", onScroll);
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        check();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}

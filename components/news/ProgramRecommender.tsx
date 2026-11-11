"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { isRealVisitor } from "@/lib/visitor";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

/**
 * 본 글 기록 기반 맞춤 추천 카드 (2026-11-11).
 * - 프로그램 카드뉴스를 볼 때마다 ID를 이 브라우저에만 기록한다(최근 30일, 최대 20개, 개인정보 없음).
 * - 같은 분야나 지역 글을 2개 이상 보면 아직 안 본 글 1건을 추천한다 — 판단은 /api/recommend(lib/news-related.ts).
 * - 화면을 덮지 않는 작은 카드로, 읽을 시간을 준 뒤(6초) 띄우고 하루 한 번만. 봇·자동화 브라우저에는 띄우지 않는다.
 */
const HISTORY_KEY = "ttw_viewed_programs";
const SHOWN_KEY = "ttw_program_reco_shown_on";
const KEEP_DAYS = 30;
const MAX_HISTORY = 20;
const SHOW_DELAY_MS = 6000;

type Viewed = { id: string; t: number };
type Rec = { item: { id: string; title: string; imageUrl: string | null; href: string }; reason: string };

const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

function recordView(id: string): Viewed[] {
  try {
    const cutoff = Date.now() - KEEP_DAYS * 86400_000;
    const prev: Viewed[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const next = [{ id, t: Date.now() }, ...prev.filter((v) => v && v.id !== id && v.t > cutoff)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export function ProgramRecommender({ currentId }: { currentId: string }) {
  const [rec, setRec] = useState<Rec | null>(null);

  useEffect(() => {
    const history = recordView(currentId);
    if (!isRealVisitor() || history.length < 2) return;
    try {
      if (localStorage.getItem(SHOWN_KEY) === today()) return;
    } catch {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    fetch(`/api/recommend?viewed=${encodeURIComponent(history.map((v) => v.id).join(","))}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Rec | { item: null } | null) => {
        if (cancelled || !data?.item || data.item.id === currentId) return;
        timer = setTimeout(() => {
          setRec(data as Rec);
          try {
            localStorage.setItem(SHOWN_KEY, today());
          } catch {}
          trackEvent(GA_EVENTS.RECO_SHOWN, { from_id: currentId, item_id: data.item!.id, reason: (data as Rec).reason });
        }, SHOW_DELAY_MS);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [currentId]);

  if (!rec) return null;

  const close = () => {
    trackEvent(GA_EVENTS.RECO_DISMISS, { item_id: rec.item.id });
    setRec(null);
  };

  return (
    <aside
      aria-label="맞춤 프로그램 추천"
      className="fixed bottom-6 left-4 right-24 sm:right-auto sm:left-6 sm:w-[22rem] z-40 rounded-2xl border border-gray-200 bg-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <button
        type="button"
        onClick={close}
        aria-label="추천 닫기"
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-text-gray hover:text-text-dark"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <Link
        href={rec.item.href}
        onClick={() => trackEvent(GA_EVENTS.RECO_CLICK, { item_id: rec.item.id, reason: rec.reason })}
        className="flex gap-3 p-3 pr-10"
      >
        {rec.item.imageUrl && (
          <span className="relative block h-[90px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
            <Image src={rec.item.imageUrl} alt="" fill sizes="72px" className="object-cover" />
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-bold text-brand-green-primary break-keep">
            {rec.reason ? `${rec.reason} 프로그램을 찾고 계신가요?` : "이런 프로그램은 어떠세요?"}
          </span>
          <span className="text-sm font-bold leading-snug text-text-dark line-clamp-2 break-keep">{rec.item.title}</span>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-green-primary">
            자세히 보기 <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </span>
      </Link>
    </aside>
  );
}

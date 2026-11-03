"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const HeroChatInputWrapper = dynamic(
  () => import("@/components/HeroChatInputWrapper").then((m) => ({ default: m.HeroChatInputWrapper })),
  {
    ssr: false,
    // 실제 입력창+제휴 카드 높이(모바일 315px, sm 이상 248px)만큼 자리를 잡아 둔다 —
    // 예전 h-14 자리표시가 로드 후 크게 늘어나 아래 내용이 밀렸다(2026-11 Lighthouse CLS 0.13)
    loading: () => (
      <div className="h-[315px] sm:h-[248px] w-full max-w-3xl mx-auto rounded-2xl bg-gray-100 animate-pulse" />
    ),
  }
);

export function DynamicHeroChat() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  return <HeroChatInputWrapper category={category} />;
}

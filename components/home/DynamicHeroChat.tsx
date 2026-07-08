"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const HeroChatInputWrapper = dynamic(
  () => import("@/components/HeroChatInputWrapper").then((m) => ({ default: m.HeroChatInputWrapper })),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 w-full max-w-3xl mx-auto rounded-xl bg-gray-100 animate-pulse" />
    ),
  }
);

export function DynamicHeroChat() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  return <HeroChatInputWrapper category={category} />;
}

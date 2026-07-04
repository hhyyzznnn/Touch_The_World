"use client";

import dynamic from "next/dynamic";

const HeroChatInputWrapper = dynamic(
  () => import("@/components/HeroChatInputWrapper").then((m) => ({ default: m.HeroChatInputWrapper })),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 w-full max-w-3xl mx-auto rounded-xl bg-gray-100 animate-pulse" />
    ),
  }
);

export function DynamicHeroChat({
  category,
  greeting,
}: {
  category?: string;
  greeting?: string | null;
}) {
  return <HeroChatInputWrapper category={category} greeting={greeting} />;
}

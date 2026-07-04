"use client";

import dynamic from "next/dynamic";

const FloatingChatButton = dynamic(
  () => import("@/components/FloatingChatButton").then((m) => ({ default: m.FloatingChatButton })),
  { ssr: false }
);

export function DynamicFloatingChat() {
  return <FloatingChatButton />;
}

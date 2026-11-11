"use client";

import Link from "next/link";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

/** 글 하단 "함께 보면 좋은 프로그램" 링크 — 클릭을 GA4에 남겨 추천 효과를 본다 */
export function RelatedProgramLink({
  href,
  fromId,
  toId,
  rank,
  className,
  children,
}: {
  href: string;
  fromId: string;
  toId: string;
  rank: number;
  className?: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={() => trackEvent(GA_EVENTS.RELATED_CLICK, { from_id: fromId, item_id: toId, rank })}
      className={className}
    >
      {children}
    </Link>
  );
}

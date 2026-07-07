"use client";

import Link from "next/link";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

interface CardNewsLinkProps {
  href: string;
  title: string;
  isExternal?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CardNewsLink({ href, title, isExternal, className, children }: CardNewsLinkProps) {
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={className}
      onClick={() => trackEvent(GA_EVENTS.CARD_NEWS_CLICK, { title })}
    >
      {children}
    </Link>
  );
}

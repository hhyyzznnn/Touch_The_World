"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";
import Link from "next/link";

export function KakaoContactButton({ href }: { href: string }) {
  return (
    <Button
      asChild
      size="lg"
      className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-6 sm:px-8 w-full sm:w-auto border border-brand-green-primary/30"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2"
        onClick={() => trackEvent(GA_EVENTS.KAKAO_CONTACT_CLICK)}
      >
        <MessageCircle className="w-5 h-5" />
        카카오톡 문의
      </a>
    </Button>
  );
}

export function PhoneLink({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${phone.replace(/-/g, "")}`}
      className="text-2xl font-semibold text-text-dark hover:text-brand-green transition-colors"
      onClick={() => trackEvent(GA_EVENTS.PHONE_CLICK)}
    >
      {phone}
    </a>
  );
}

export function KakaoContactPlaceholder() {
  return (
    <Button
      asChild
      size="lg"
      className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-6 sm:px-8 w-full sm:w-auto border border-brand-green-primary/30"
    >
      <Link href="/inquiry" className="flex items-center justify-center gap-2">
        <MessageCircle className="w-5 h-5" />
        카카오톡 채널 준비중
      </Link>
    </Button>
  );
}

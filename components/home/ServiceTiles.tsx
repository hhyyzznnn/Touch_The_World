"use client";

import Link from "next/link";
import { MapPin, GraduationCap, Briefcase, Plane, ClipboardList, MessageCircle, type LucideIcon } from "lucide-react";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

/**
 * 메인 첫 화면 "터치더월드가 하는 일" 6칸 (2026-11-17, 메인 개선 A안).
 * 첫 화면에서 회사가 제공하는 서비스를 한눈에 보여 준다. 예전 이 자리의 제휴 카드(FamilyCards)는
 * 아래 "어떤 프로그램이 필요하신가요?" 구역으로 옮겼다.
 */
const SERVICES: { title: string; desc: string; href: string; icon: LucideIcon }[] = [
  { title: "교육여행", desc: "국내·일본·해외 수학여행, 체험학습, 수련활동", href: "/programs", icon: MapPin },
  {
    title: "교직원 연수·여행",
    desc: "연수 기획, 하나투어 교직원 혜택",
    href: `/programs?category=${encodeURIComponent("교직원 연수·혜택")}`,
    icon: GraduationCap,
  },
  {
    title: "특성화고 전공 연계",
    desc: "전공 체험, 국외 현장학습",
    href: `/programs?category=${encodeURIComponent("특성화고 프로그램")}`,
    icon: Briefcase,
  },
  {
    title: "일본 유학",
    desc: "아소전문학교, 야나기가우라고",
    href: `/programs?category=${encodeURIComponent("일본 유학")}`,
    icon: Plane,
  },
  { title: "교사 멤버십", desc: "서류·안전 양식집, 무료 가입", href: "/membership?from=home_services", icon: ClipboardList },
  { title: "상담·견적", desc: "AI 상담, 맞춤 일정 견적", href: "/inquiry", icon: MessageCircle },
];

export function ServiceTiles() {
  return (
    <nav aria-label="터치더월드가 하는 일" className="text-left">
      <p className="mb-2 text-sm font-bold text-text-dark">터치더월드가 하는 일</p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {SERVICES.map(({ title, desc, href, icon: Icon }) => (
          <li key={title}>
            <Link
              href={href}
              onClick={() => trackEvent(GA_EVENTS.SERVICE_CLICK, { service: title })}
              className="flex h-full min-h-[44px] items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-brand-green-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-primary sm:px-4"
            >
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green-primary" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-text-dark break-keep sm:text-[15px]">{title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-text-gray break-keep sm:text-[13px]">{desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

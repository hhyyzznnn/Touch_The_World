"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { trackEvent } from "@/lib/gtag";
import { MEMBERSHIP_TIERS } from "@/lib/membership";

// 기본(무료) 단계 대표 혜택 중 앞의 3개
const FREE_BENEFITS = MEMBERSHIP_TIERS[0].keyBenefits.slice(0, 3);

/** 메인 첫 화면 바로 아래 교사 멤버십 안내 */
export function MembershipBanner() {
  const track = (target: string) => trackEvent("membership_banner_click", { target });

  return (
    <section className="bg-white px-4 pb-10 sm:pb-14">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 rounded-2xl bg-[#1B4332] px-5 py-6 text-white break-keep sm:px-8 sm:py-7 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              교사 멤버십 · 무료 가입
            </p>
            <h2 className="mt-3 text-lg font-bold leading-snug sm:text-2xl text-balance">
              교육여행 담당 선생님의 1년 업무를 함께합니다
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/85">
              {FREE_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#9AD9B0]" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <Link
              href="/membership#join"
              onClick={() => track("join")}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1B4332] transition-colors hover:bg-white/90"
            >
              무료로 가입하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/membership"
              onClick={() => track("detail")}
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              혜택 자세히 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

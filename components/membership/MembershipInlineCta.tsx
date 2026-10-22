"use client";

import Link from "next/link";
import { ArrowRight, BellRing } from "lucide-react";
import { trackEvent } from "@/lib/gtag";

/**
 * 카드뉴스 상세 하단 멤버십 안내 — 방문자 대부분이 검색으로 카드뉴스에 바로 들어와
 * 메인 배너를 볼 일이 적어(2026-10 GA 확인), 실제로 머무는 자리에 둔다.
 * 마감일이 있는 글에서는 "이런 마감 소식"을 앞세운다.
 */
export function MembershipInlineCta({ hasDeadline, postId }: { hasDeadline: boolean; postId: string }) {
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-xl bg-[#1B4332] p-5 text-white break-keep sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 rounded-full bg-white/15 p-2.5">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold leading-snug">
            {hasDeadline ? "이런 마감 소식, 놓치지 않게 먼저 알려드릴게요" : "교육여행 담당 선생님을 위한 무료 멤버십"}
          </p>
          <p className="mt-1 text-sm text-white/80">
            지원사업 마감 알림 · 서류·안전 양식집 · 월간 교육여행 소식을 무료로 받아보세요.
          </p>
        </div>
      </div>
      <Link
        href="/membership?from=news_detail#join"
        onClick={() => trackEvent("membership_banner_click", { target: "news_detail", post_id: postId })}
        className="inline-flex w-full flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#1B4332] transition-colors hover:bg-white/90 sm:w-auto"
      >
        무료로 가입하기
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

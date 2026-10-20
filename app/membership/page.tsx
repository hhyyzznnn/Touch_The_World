import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Check, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_BUNDLES, MEMBERSHIP_TIERS } from "@/lib/membership";
import { formatEndDate, stripBrandFromTitle } from "@/lib/news-utils";
import { MembershipJoinForm } from "@/components/membership/MembershipJoinForm";

export const metadata: Metadata = {
  title: "교사 멤버십 | 터치더월드",
  description:
    "계획서·가정통신문·지원사업 신청부터 결과보고까지, 교육여행 담당 선생님의 1년 업무를 함께하는 터치더월드 멤버십. 지원사업 마감 알림과 서류·안전 양식집을 무료로 받아보세요.",
  alternates: { canonical: "/membership" },
};

export const revalidate = 600;

// 마감일이 지나지 않은 게시물 — 지원사업·사전예약처럼 기한이 있는 안내
async function getUpcomingDeadlines() {
  return prisma.companyNews.findMany({
    where: { endDate: { gte: new Date() } },
    orderBy: { endDate: "asc" },
    take: 6,
    select: { id: true, title: true, endDate: true },
  });
}

const TIER_LABEL = { 1: "기본", 2: "플러스", 3: "프리미엄" } as const;
const TIER_STYLE = {
  1: "bg-brand-green-primary text-white",
  2: "bg-brand-green-primary/15 text-brand-green-primary",
  3: "bg-[#1B4332] text-white",
} as const;

const FAQ = [
  {
    q: "여행 계약이나 견적 가격과 관계가 있나요?",
    a: "관계없습니다. 멤버십은 학교 업무를 돕는 자료·안내 서비스이며, 계약 조건이나 가격 우대는 없습니다.",
  },
  {
    q: "업체 선정이나 입찰에 영향이 있나요?",
    a: "없습니다. 회원 여부는 업체 선정·입찰·계약과 무관하며, 비교견적도 자유롭게 받으셔도 됩니다. 선생님 개인에게 금품이나 할인은 제공하지 않습니다.",
  },
  {
    q: "학교 예산으로 이용할 수 있나요?",
    a: "프리미엄은 학교 예산으로 이용하실 수 있도록 준비하고 있습니다. 결제 방법과 필요한 서류는 출시와 함께 안내해 드립니다.",
  },
  {
    q: "플러스·프리미엄은 언제부터 이용할 수 있나요?",
    a: "지금은 체험단을 모집하고 있습니다. 가입하실 때 체험단 참여를 선택해 주시면 먼저 연락드립니다.",
  },
];

export default async function MembershipPage() {
  const deadlines = await getUpcomingDeadlines();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-14 break-keep">
      <section className="text-center">
        <p className="text-sm font-semibold text-brand-green-primary">교사 멤버십</p>
        <h1 className="mt-2 text-2xl sm:text-4xl font-bold leading-snug text-balance">
          교육여행 담당 선생님의 1년 업무를 함께합니다
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-text-gray leading-relaxed text-balance">
          계획서, 가정통신문, 지원사업 신청부터 결과보고까지. 교육여행 앞뒤로 따라오는 일을 터치더월드가 함께 덜어드립니다.
        </p>
        <a
          href="#join"
          className="mt-6 inline-flex rounded-full bg-brand-green-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-green-primary/90"
        >
          무료로 시작하기
        </a>
      </section>

      {deadlines.length > 0 && (
        <section>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-brand-green-primary" />
            <h2 className="text-lg font-bold">놓치면 안 되는 마감</h2>
          </div>
          <p className="mt-1 text-sm text-text-gray">회원이 되시면 이런 마감 소식을 미리 메일로 받아보실 수 있습니다.</p>
          <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {deadlines.map((d) => (
              <li key={d.id}>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                  <Link
                    href={`/news/${d.id}`}
                    className="min-w-0 basis-full sm:basis-auto sm:flex-1 line-clamp-2 sm:truncate text-sm text-text-dark hover:text-brand-green-primary hover:underline"
                  >
                    {stripBrandFromTitle(d.title)}
                  </Link>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      ~{d.endDate ? formatEndDate(d.endDate) : ""}
                    </span>
                    <Link
                      href={`/inquiry?programRef=${encodeURIComponent(stripBrandFromTitle(d.title))}`}
                      className="rounded-full border border-brand-green-primary px-3 py-1 text-xs font-semibold text-brand-green-primary hover:bg-brand-green-primary hover:text-white"
                    >
                      신청 문의
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold">단계별 구성</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {MEMBERSHIP_TIERS.map((t) => (
            <div
              key={t.tier}
              className={`flex flex-col rounded-2xl border bg-white p-5 ${t.tier === 1 ? "border-brand-green-primary" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TIER_STYLE[t.tier]}`}>{t.name}</span>
                <span className="text-xs text-text-gray">{t.status}</span>
              </div>
              <p className="mt-3 text-xl font-bold">{t.headline}</p>
              <p className="text-sm text-gray-600 text-balance">{t.target}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {t.includes && <li className="font-medium text-text-gray">{t.includes}</li>}
                {t.keyBenefits.map((name) => (
                  <li key={name} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green-primary" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 text-xs font-medium text-text-gray">{t.price}</p>
            </div>
          ))}
        </div>

        <details className="group mt-4 rounded-2xl border border-gray-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            혜택 전체 보기
            <ChevronDown className="h-4 w-4 text-text-gray transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-x-8 gap-y-6 border-t border-gray-100 p-5 md:grid-cols-2">
            {MEMBERSHIP_BUNDLES.map((bundle) => (
              <div key={bundle.key}>
                <h3 className="font-semibold">{bundle.key}</h3>
                <ul className="mt-2.5 space-y-2.5">
                  {bundle.items.map((item) => (
                    <li key={item.name} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 w-14 flex-shrink-0 rounded py-0.5 text-center text-[11px] font-semibold ${TIER_STYLE[item.tier]}`}>
                        {TIER_LABEL[item.tier]}
                      </span>
                      <span>
                        <b className="font-medium">{item.name}</b>
                        <span className="block text-[13px] leading-snug text-gray-600">{item.desc}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </section>

      <section id="join" className="scroll-mt-24">
        <h2 className="text-lg font-bold">무료 회원 가입</h2>
        <p className="mt-1 text-sm text-text-gray">홈페이지 회원가입 없이 바로 가입하실 수 있습니다.</p>
        <div className="mt-4">
          <MembershipJoinForm />
        </div>
      </section>

      <section className="rounded-2xl bg-gray-50 p-5 sm:p-6 text-sm leading-relaxed">
        <h2 className="font-bold">자주 묻는 질문</h2>
        <dl className="mt-3 space-y-3">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="text-text-gray">{f.a}</dd>
            </div>
          ))}
          <div>
            <dt className="font-medium">탈퇴나 수신 거부는 어떻게 하나요?</dt>
            <dd className="text-text-gray">
              <Link href="/inquiry" className="text-brand-green-primary underline">문의하기</Link> 또는 전화(1800-8078)로 말씀해 주시면 바로 처리해 드립니다.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

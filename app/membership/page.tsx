import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_BUNDLES, MEMBERSHIP_TIERS } from "@/lib/membership";
import { formatEndDate, stripBrandFromTitle } from "@/lib/news-utils";
import { MembershipJoinForm } from "@/components/membership/MembershipJoinForm";

export const metadata: Metadata = {
  title: "교사 멤버십 | 터치더월드",
  description:
    "교육여행 담당 선생님의 1년 업무를 함께 챙기는 터치더월드 멤버십. 기본 단계는 무료로 월간 교육여행 소식과 상담 이력 저장을 제공합니다.",
  alternates: { canonical: "/membership" },
};

export const revalidate = 600;

// 마감일이 지나지 않은 게시물 — 지원사업·사전예약처럼 기한이 있는 안내를 가입 전에도 보여준다.
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
  3: "bg-gray-200 text-text-dark",
} as const;

export default async function MembershipPage() {
  const deadlines = await getUpcomingDeadlines();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-14">
      <section className="text-center">
        <p className="text-sm font-semibold text-brand-green-primary">교사 멤버십</p>
        <h1 className="mt-2 text-2xl sm:text-4xl font-bold leading-snug">
          교육여행 담당 선생님의
          <br className="sm:hidden" /> 1년 업무를 같이 챙깁니다
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-text-gray leading-relaxed">
          계획서·가정통신문·지원사업 신청·사전교육·결과보고까지, 견적 앞뒤로 이어지는 일을 덜어드리는 멤버십입니다.
          기본 단계는 무료이고, 플러스·프리미엄은 시범 운영을 거쳐 정식으로 엽니다.
        </p>
        <a
          href="#join"
          className="mt-6 inline-flex rounded-full bg-brand-green-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-green-primary/90"
        >
          무료로 가입하기
        </a>
      </section>

      {deadlines.length > 0 && (
        <section>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-brand-green-primary" />
            <h2 className="text-lg font-bold">지금 마감이 다가오는 안내</h2>
          </div>
          <p className="mt-1 text-sm text-text-gray">플러스 단계부터는 이런 마감을 미리 알려드립니다.</p>
          <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {deadlines.map((d) => (
              <li key={d.id}>
                <Link href={`/news/${d.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50">
                  <span className="truncate text-sm text-text-dark">{stripBrandFromTitle(d.title)}</span>
                  <span className="flex-shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    ~{d.endDate ? formatEndDate(d.endDate) : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold">단계별 구성</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {MEMBERSHIP_TIERS.map((t) => (
            <div key={t.tier} className={`rounded-2xl border p-5 ${t.tier === 1 ? "border-brand-green-primary" : "border-gray-200"} bg-white`}>
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TIER_STYLE[t.tier]}`}>{t.name}</span>
                <span className="text-xs text-text-gray">{t.status}</span>
              </div>
              <p className="mt-3 text-xl font-bold">{t.price}</p>
              <p className="text-xs text-text-gray">{t.target}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {MEMBERSHIP_BUNDLES.flatMap((b) => b.items)
                  .filter((i) => i.tier === t.tier)
                  .map((i) => (
                    <li key={i.name} className="flex gap-2">
                      <span className="text-brand-green-primary">✓</span>
                      <span>{i.name}</span>
                    </li>
                  ))}
              </ul>
              {t.tier > 1 && <p className="mt-3 text-xs text-text-gray">+ 아래 단계 혜택 모두 포함</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">혜택 자세히 보기</h2>
        <p className="mt-1 text-sm text-text-gray">지금까지 진행하고 소개한 프로그램에서, 선생님 손이 가장 많이 가는 일을 골랐습니다.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {MEMBERSHIP_BUNDLES.map((bundle) => (
            <div key={bundle.key} className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold">{bundle.key}</h3>
              <p className="text-xs text-text-gray">근거: {bundle.basis}</p>
              <ul className="mt-3 space-y-2.5">
                {bundle.items.map((item) => (
                  <li key={item.name} className="flex items-start gap-2.5 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${TIER_STYLE[item.tier]}`}>
                      {TIER_LABEL[item.tier]}
                    </span>
                    <span>
                      <b className="font-medium">{item.name}</b>
                      <span className="block text-xs text-text-gray">{item.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="join" className="scroll-mt-24">
        <h2 className="text-lg font-bold">기본 멤버십 가입</h2>
        <p className="mt-1 text-sm text-text-gray">로그인 없이 가입할 수 있습니다. 비용은 들지 않습니다.</p>
        <div className="mt-4">
          <MembershipJoinForm />
        </div>
      </section>

      <section className="rounded-2xl bg-gray-50 p-5 sm:p-6 text-sm leading-relaxed">
        <h2 className="font-bold">자주 묻는 질문</h2>
        <dl className="mt-3 space-y-3">
          <div>
            <dt className="font-medium">멤버십이 여행 계약이나 견적 가격에 영향을 주나요?</dt>
            <dd className="text-text-gray">아니요. 멤버십은 업무 자료·안내 서비스이며, 계약 조건이나 가격 우대와는 관계가 없습니다.</dd>
          </div>
          <div>
            <dt className="font-medium">플러스·프리미엄은 언제 이용할 수 있나요?</dt>
            <dd className="text-text-gray">시범 운영에서 선생님들 의견을 받은 뒤 요금과 이용 횟수를 정해 안내드립니다.</dd>
          </div>
          <div>
            <dt className="font-medium">탈퇴나 수신 거부는 어떻게 하나요?</dt>
            <dd className="text-text-gray">
              <Link href="/inquiry" className="text-brand-green-primary underline">문의하기</Link> 또는 전화(1800-8078)로 말씀해주시면 바로 처리합니다.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

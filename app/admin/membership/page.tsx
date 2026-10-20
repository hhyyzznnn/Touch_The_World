import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { classifyTouch, sanitizeAttribution } from "@/lib/attribution";
import { MEMBERSHIP_ENTRY_POINTS, MEMBERSHIP_INTERESTS, parseEntryPoint } from "@/lib/membership";

export const dynamic = "force-dynamic";

const TIER_NAME: Record<string, string> = { basic: "기본", pilot: "시범 운영", plus: "플러스", premium: "프리미엄" };

export default async function AdminMembershipPage() {
  const members = await prisma.membershipMember.findMany({ orderBy: { createdAt: "desc" } });
  const newsletter = members.filter((m) => m.newsletterOptIn);
  const pilot = members.filter((m) => m.pilotInterest);
  const interestCounts = MEMBERSHIP_INTERESTS.map((i) => ({ label: i, count: members.filter((m) => m.interests.includes(i)).length }));
  const maxInterest = Math.max(1, ...interestCounts.map((i) => i.count));
  const viaOf = (m: (typeof members)[number]) => parseEntryPoint((m.attribution as { via?: unknown } | null)?.via);
  const viaCounts = [
    ...Object.entries(MEMBERSHIP_ENTRY_POINTS).map(([key, label]) => ({ label, count: members.filter((m) => viaOf(m) === key).length })),
    { label: "직접·기타", count: members.filter((m) => !viaOf(m)).length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">멤버십 회원</h1>
          <p className="mt-1 text-sm text-text-gray">1단계: 무료 기본 가입 + 유료 단계 시범 운영 신청</p>
        </div>
        <Link href="/membership" target="_blank" className="text-sm text-brand-green-primary hover:underline">
          안내 페이지 보기 ↗
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "전체 가입", value: members.length },
          { label: "시범 운영 희망", value: pilot.length },
          { label: "소식 수신 동의", value: newsletter.length },
          ...viaCounts.map((v) => ({ label: `가입 경로 · ${v.label}`, value: v.count })),
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-text-gray">{c.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{c.value}명</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">관심 혜택</h2>
          <p className="text-xs text-text-gray">시범 운영에 먼저 넣을 혜택을 고를 때 참고</p>
          <ul className="mt-4 space-y-2">
            {interestCounts.map((i) => (
              <li key={i.label} className="text-sm">
                <div className="flex justify-between">
                  <span>{i.label}</span>
                  <span className="tabular-nums text-text-gray">{i.count}명</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full bg-brand-green-primary" style={{ width: `${(i.count / maxInterest) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">월간 소식 발송 대상</h2>
          <p className="text-xs text-text-gray">수신 동의한 회원 이메일 — 복사해서 메일 발송 도구에 붙여 넣기</p>
          <textarea
            readOnly
            className="mt-3 h-40 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs font-mono"
            value={newsletter.map((m) => m.email).join(", ")}
          />
        </section>
      </div>

      <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-xs text-text-gray">
            <tr>
              <th className="px-4 py-3">가입일</th>
              <th className="px-4 py-3">이름 · 학교</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">관심 혜택</th>
              <th className="px-4 py-3">단계</th>
              <th className="px-4 py-3">유입</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-gray">아직 가입한 회원이 없습니다.</td>
              </tr>
            )}
            {members.map((m) => {
              const attribution = sanitizeAttribution(m.attribution);
              const via = parseEntryPoint((m.attribution as { via?: unknown } | null)?.via);
              return (
                <tr key={m.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-text-gray">{format(m.createdAt, "yyyy-MM-dd")}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.name} {m.position && <span className="text-xs text-text-gray">({m.position})</span>}</p>
                    <p className="text-xs text-text-gray">{m.schoolName}{m.schoolLevel ? ` · ${m.schoolLevel}` : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p>{m.email}</p>
                    {m.phone && <p className="text-text-gray">{m.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-gray">{m.interests.join(", ") || "-"}</td>
                  <td className="px-4 py-3 text-xs">
                    {TIER_NAME[m.tier] ?? m.tier}
                    {m.pilotInterest && <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">시범 희망</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-gray">
                    <p>{attribution ? classifyTouch(attribution.first ?? attribution.last) : "-"}</p>
                    {via && <p className="text-brand-green-primary">{MEMBERSHIP_ENTRY_POINTS[via]}</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

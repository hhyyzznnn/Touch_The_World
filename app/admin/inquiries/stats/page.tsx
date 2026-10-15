import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildInquiryStats, type Count } from "@/lib/inquiry-stats";
import { getInquiryStatusMeta } from "@/lib/inquiry-status";

export const dynamic = "force-dynamic";

// 자동점검용 테스트 문의는 통계에서 뺀다
const TEST_PREFIX = "[자동점검]";

function BarList({ title, items, total, note }: { title: string; items: Count[]; total: number; note?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-text-dark">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-text-gray">{note}</p>}
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-text-gray">아직 데이터가 없습니다.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.label} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate text-text-dark">{item.label}</span>
                <span className="flex-shrink-0 tabular-nums text-text-gray">
                  {item.count}건 · {Math.round((item.count / Math.max(1, total)) * 100)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-brand-green-primary" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function InquiryStatsPage() {
  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  const rows = await prisma.inquiry.findMany({
    where: { createdAt: { gte: since }, NOT: { schoolName: { startsWith: TEST_PREFIX } } },
    select: {
      createdAt: true,
      sourceType: true,
      status: true,
      linkedEventId: true,
      purpose: true,
      schoolLevel: true,
      destination: true,
      attribution: true,
    },
  });
  const stats = buildInquiryStats(rows);
  const maxMonth = Math.max(1, ...stats.monthly.map((m) => m.form + m.chatbot));
  const statusItems = stats.status.map((s) => ({ ...s, label: getInquiryStatusMeta(s.label).label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">문의 통계</h1>
          <p className="mt-1 text-sm text-text-gray">최근 12개월 · 테스트 문의 제외</p>
        </div>
        <Link href="/admin/inquiries" className="text-sm text-brand-green-primary hover:underline">
          ← 문의 목록
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "전체 문의", value: `${stats.total}건` },
          { label: "진행·완료로 이어진 문의", value: `${stats.progressed}건`, sub: `${Math.round((stats.progressed / Math.max(1, stats.total)) * 100)}%` },
          { label: "진행 내역으로 전환", value: `${stats.linkedToEvent}건` },
          { label: "유입 경로 기록된 문의", value: `${stats.tracked}건`, sub: "2026-10-15부터 기록" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-text-gray">{card.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{card.value}</p>
            {card.sub && <p className="text-xs text-text-gray">{card.sub}</p>}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-text-dark">월별 문의</h2>
        <p className="mt-0.5 text-xs text-text-gray">진한 색: 문의 폼 · 연한 색: 챗봇 상담에서 자동 접수</p>
        <div className="mt-4 flex h-40 items-end gap-1.5 sm:gap-3">
          {stats.monthly.map((m) => {
            const total = m.form + m.chatbot;
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums text-text-gray">{total || ""}</span>
                <div className="flex w-full flex-col justify-end" style={{ height: `${(total / maxMonth) * 100}%` }}>
                  <div className="w-full rounded-t bg-brand-green-primary/40" style={{ flex: m.chatbot }} />
                  <div className="w-full bg-brand-green-primary" style={{ flex: m.form }} />
                </div>
                <span className="text-[10px] sm:text-xs text-text-gray">{Number(m.month.slice(5))}월</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <BarList title="처음 들어온 경로" items={stats.firstChannel} total={stats.tracked} note="문의한 분이 사이트를 처음 알게 된 경로" />
        <BarList title="문의 직전 들어온 경로" items={stats.lastChannel} total={stats.tracked} note="문의를 남긴 방문의 직전 유입 경로" />
        <BarList title="처음 들어온 페이지" items={stats.landing} total={stats.tracked} note="어떤 글·페이지가 첫 접점이었는지 (상위 10개)" />
        <BarList title="진행 상태" items={statusItems} total={stats.total} />
        <BarList title="여행 목적" items={stats.purpose} total={stats.total} />
        <BarList title="학교급" items={stats.schoolLevel} total={stats.total} />
        <BarList title="희망 지역" items={stats.destination} total={stats.total} />
      </div>
    </div>
  );
}

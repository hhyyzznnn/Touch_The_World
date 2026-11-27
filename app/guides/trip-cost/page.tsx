import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { getCostReport } from "@/lib/trip-cost-data";
import { TRIP_DESTINATIONS, TRIP_LENGTHS, manwon, type CostRange } from "@/lib/trip-cost";

/**
 * 수학여행·체험학습 1인당 비용 가이드 (2026-11-27) — 나라장터에 올라온 학교 입찰 공고의 1인당 금액을
 * 목적지·기간별로 모아 매일 다시 계산한다(lib/trip-cost.ts). 선생님이 예산을 잡을 때 참고할 실제 금액이자,
 * 검색·AI가 인용할 수 있는 우리만의 자료. 문의 페이지 '예상 비용 먼저 보기'와 같은 데이터.
 */
export const revalidate = 86_400;

const TITLE = "2027 수학여행·체험학습 1인당 비용 — 제주·국내·수련활동·일본·해외";

export async function generateMetadata(): Promise<Metadata> {
  const { table } = await getCostReport().catch(() => ({ table: { sampleSize: 0 } }));
  const description = `학교가 나라장터에 올린 수학여행·체험학습 입찰 공고 ${table.sampleSize}건의 1인당 금액을 목적지·기간별로 정리했습니다. 2027학년도 예산을 잡을 때 참고하세요. 매일 새 공고로 다시 계산합니다.`;
  return {
    title: `${TITLE} | 터치더월드`,
    description,
    keywords: mergeKeywords(BRAND_KEYWORDS, [
      "수학여행 비용",
      "수학여행 1인당 비용",
      "제주 수학여행 비용",
      "일본 수학여행 비용",
      "수련활동 비용",
      "현장체험학습 비용",
      "2027 수학여행 예산",
    ]),
    alternates: { canonical: "/guides/trip-cost" },
    openGraph: {
      title: TITLE,
      description,
      url: "/guides/trip-cost",
      siteName: "터치더월드",
      locale: "ko_KR",
      type: "article",
      images: [{ url: "/images/og_image3.png", width: 1376, height: 768, alt: "터치더월드 | 교육여행 전문" }],
    },
  };
}

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="text-xl md:text-2xl font-bold text-text-dark break-keep">{title}</h2>
      {lead && <p className="mt-2 text-base leading-[1.7] text-text-gray break-keep">{lead}</p>}
      <div className="mt-4 space-y-4 text-base leading-[1.7] text-text-dark break-keep">{children}</div>
    </section>
  );
}

const rangeText = (r: CostRange) => `${manwon(r.low)}~${manwon(r.high)} 원`;

export default async function TripCostGuidePage() {
  const { table, from, to } = await getCostReport();
  const dests = TRIP_DESTINATIONS.filter((d) => table.overall[d]);
  const fmt = (d: string | null) => (d ? d.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1년 $2월 $3일").replace(/ 0/g, " ") : "");
  const period = from && to ? `${fmt(from)} ~ ${fmt(to)}` : "";

  const faqs = dests.map((d) => {
    const o = table.overall[d]!;
    const lens = TRIP_LENGTHS.filter((l) => table.byLength[d]?.[l.key]).map((l) => `${l.label}은 ${rangeText(table.byLength[d]![l.key]!)}`);
    return {
      q: `${d === "국내" ? "국내(제주 외)" : d} ${d === "수련활동" ? "" : "수학여행 "}1인당 비용은 얼마인가요?`.replace("  ", " "),
      a: `최근 학교 입찰 공고 ${o.count}건 기준으로 1인당 약 ${rangeText(o)}(중간값 ${manwon(o.mid)} 원)입니다.${lens.length ? ` 기간별로는 ${lens.join(", ")}입니다.` : ""} 실제 금액은 인원·일정·숙소·포함 항목에 따라 달라집니다.`,
    };
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: TITLE,
      description: `학교 입찰 공고 ${table.sampleSize}건의 1인당 금액을 목적지·기간별로 정리`,
      dateModified: to ?? undefined,
      author: { "@type": "Organization", name: "터치더월드" },
      publisher: { "@type": "Organization", name: "터치더월드" },
      inLanguage: "ko-KR",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-6">
        <header>
          <p className="text-sm font-semibold text-brand-green-primary">선생님 업무 안내</p>
          <h1 className="mt-1 text-2xl md:text-4xl font-bold text-text-dark break-keep text-balance">{TITLE}</h1>
          <p className="mt-3 text-base leading-[1.7] text-text-gray break-keep">
            학교가 나라장터에 올린 수학여행·체험학습 입찰 공고에 적힌 1인당 금액을 목적지와 기간별로 모았습니다.
            2027학년도 예산을 잡거나 업체 견적을 비교하실 때 참고해 주세요. 새 공고가 올라오면 매일 다시 계산합니다.
          </p>
          <p className="mt-2 text-sm text-text-gray">
            집계 기준: 공고 {table.sampleSize}건{period ? ` · ${period} 수집` : ""}
          </p>
        </header>

        <section id="summary" className="scroll-mt-24 rounded-2xl bg-[#1B4332] p-5 sm:p-7 text-white">
          <h2 className="text-xl md:text-2xl font-bold">한눈에 보기 (1인당)</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {dests.map((d) => {
              const o = table.overall[d]!;
              return (
                <li key={d} className="rounded-xl bg-white/10 p-4">
                  <p className="text-sm text-white/80">{d}</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums">약 {rangeText(o)}</p>
                  <p className="mt-0.5 text-xs text-white/70">중간값 {manwon(o.mid)} 원 · 공고 {o.count}건</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-white/80 break-keep">범위는 공고 금액을 낮은 순으로 줄 세웠을 때 하위 25%~상위 25% 구간입니다.</p>
        </section>

        <Section id="by-length" title="기간별 1인당 금액" lead="같은 목적지라도 박 수에 따라 금액이 달라집니다. 공고가 5건 이상 모인 기간만 표시했습니다.">
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["목적지", "기간", "1인당 범위", "중간값", "공고 수"].map((h) => (
                    <th key={h} scope="col" className="border-b border-gray-200 px-3 py-2.5 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dests.flatMap((d) =>
                  TRIP_LENGTHS.filter((l) => table.byLength[d]?.[l.key]).map((l) => {
                    const r = table.byLength[d]![l.key]!;
                    return (
                      <tr key={`${d}-${l.key}`} className="border-b border-gray-100">
                        <td className="px-3 py-2.5 font-medium">{d}</td>
                        <td className="px-3 py-2.5">{l.label}</td>
                        <td className="px-3 py-2.5 tabular-nums">약 {rangeText(r)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{manwon(r.mid)} 원</td>
                        <td className="px-3 py-2.5 tabular-nums">{r.count}건</td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="factors" title="금액이 달라지는 이유" lead="같은 목적지·기간이어도 공고마다 금액 차이가 나는 데에는 몇 가지 이유가 있습니다.">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><b>인원</b> — 버스·인솔·숙소를 나누어 부담하므로, 인원이 많을수록 1인당 금액이 내려가는 편입니다.</li>
            <li><b>숙소 등급과 객실 배정</b> — 호텔 등급, 1실 인원, 단일 숙소 조건에 따라 달라집니다.</li>
            <li><b>이동 수단</b> — 제주·해외는 항공·선박 요금과 출발 시기의 영향을 크게 받습니다.</li>
            <li><b>포함 항목</b> — 여행자 보험, 안전요원, 체험 프로그램, 식사 횟수를 포함하는지에 따라 차이가 납니다.</li>
          </ul>
          <p>
            안전요원 기준과 지자체 지원 제도는{" "}
            <Link href="/guides/field-trip" className="font-medium text-brand-green-primary underline underline-offset-2">현장체험학습·수학여행 준비 기준 정리</Link>에서 확인하실 수 있습니다.
          </p>
        </Section>

        {faqs.length > 0 && (
          <Section id="faq" title="자주 묻는 질문">
            <dl className="space-y-4">
              {faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-bold">{f.q}</dt>
                  <dd className="mt-1 text-text-gray">{f.a}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        <section className="rounded-2xl border border-brand-green-primary/25 bg-brand-green-primary/[0.05] p-5 sm:p-7">
          <h2 className="text-lg font-bold text-text-dark break-keep">우리 학교 조건으로 견적 받기</h2>
          <p className="mt-2 text-base leading-[1.7] text-text-gray break-keep">
            학년·인원·희망 시기를 알려 주시면 일정과 견적을 맞춰 보내 드립니다. 문의 페이지에서 목적지와 기간을 고르면 예상 비용을 바로 확인하실 수 있습니다.
          </p>
          <Link
            href="/inquiry"
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand-green-primary px-5 text-sm font-semibold text-white hover:bg-brand-green-primary/90"
          >
            예상 비용 보고 문의하기
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <p className="px-1 text-sm leading-[1.7] text-text-gray break-keep">
          자료 기준: 조달청 나라장터에 공개된 초·중·고 수학여행·체험학습·수련활동 입찰 공고 중 1인당 금액이 확인되는 공고. 공고문에 적힌 예정 금액이라 실제 계약 금액과 다를 수 있으며,
          총액만 적힌 공고와 1인당 5만 원 미만·1,000만 원 초과 값은 제외했습니다.
        </p>
      </div>
    </div>
  );
}

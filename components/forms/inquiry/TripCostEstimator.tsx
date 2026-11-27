"use client";

import { useMemo, useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";
import { TRIP_DESTINATIONS, TRIP_LENGTHS, manwon, type CostRange, type CostTable, type TripDestination } from "@/lib/trip-cost";

export interface CostSelection {
  destination: TripDestination;
  lengthLabel: string | null;
  range: CostRange;
}

/**
 * 예상 비용 바로 보기 (2026-11-27) — 목적지·기간을 고르면 최근 학교 입찰 공고 기준 1인당 범위를 보여 주고,
 * "이 조건으로 견적 받기"로 그 내용이 채워진 문의 양식으로 잇는다. 계산은 lib/trip-cost.ts.
 */
export function TripCostEstimator({ table, onApplyAction }: { table: CostTable; onApplyAction: (s: CostSelection) => void }) {
  const destinations = TRIP_DESTINATIONS.filter((d) => table.overall[d]);
  const [dest, setDest] = useState<TripDestination | null>(destinations[0] ?? null);
  const lengths = useMemo(
    () => (dest ? TRIP_LENGTHS.filter((l) => table.byLength[dest]?.[l.key]) : []),
    [dest, table],
  );
  const [lengthKey, setLengthKey] = useState<number | null>(null);
  if (!dest) return null;

  const activeLength = lengths.find((l) => l.key === lengthKey) ?? lengths[0] ?? null;
  const range = (activeLength && table.byLength[dest]?.[activeLength.key]) || table.overall[dest]!;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition-colors ${
      active ? "border-brand-green-primary bg-brand-green-primary text-white" : "border-gray-200 bg-white text-text-dark hover:border-brand-green-primary/40"
    }`;

  return (
    <section aria-labelledby="cost-estimator-title" className="mb-8 rounded-xl border border-brand-green-primary/25 bg-brand-green-primary/[0.04] p-4 sm:p-5">
      <h2 id="cost-estimator-title" className="flex items-center gap-2 text-base font-semibold text-text-dark">
        <Calculator className="h-4 w-4 text-brand-green-primary" aria-hidden />
        예상 비용 먼저 보기
      </h2>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="목적지">
        {destinations.map((d) => (
          <button key={d} type="button" aria-pressed={d === dest} onClick={() => { setDest(d); setLengthKey(null); trackEvent(GA_EVENTS.COST_ESTIMATE_SELECT, { destination: d }); }} className={chip(d === dest)}>
            {d}
          </button>
        ))}
      </div>
      {lengths.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="기간">
          {lengths.map((l) => (
            <button key={l.key} type="button" aria-pressed={l.key === activeLength?.key} onClick={() => { setLengthKey(l.key); trackEvent(GA_EVENTS.COST_ESTIMATE_SELECT, { destination: dest, length: l.label }); }} className={chip(l.key === activeLength?.key)}>
              {l.label}
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-text-gray">
        {dest}
        {activeLength ? ` ${activeLength.label}` : ""} · 1인당
      </p>
      <p className="text-2xl font-bold tabular-nums text-brand-green-primary">
        약 {manwon(range.low)}~{manwon(range.high)} 원
      </p>
      <p className="mt-1 break-keep text-xs text-text-gray">
        최근 학교 입찰 공고 {range.count}건 기준 참고 금액입니다. 실제 견적은 일정·인원·숙소·포함 항목에 따라 달라집니다.{" "}
        <a href="/guides/trip-cost" className="font-medium text-brand-green-primary underline underline-offset-2">목적지별 비용 자세히 보기</a>
      </p>

      <button
        type="button"
        onClick={() => {
          trackEvent(GA_EVENTS.COST_ESTIMATE_APPLY, { destination: dest, length: activeLength?.label ?? "전체" });
          onApplyAction({ destination: dest, lengthLabel: activeLength?.label ?? null, range });
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-green-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-primary/90 sm:w-auto"
      >
        이 조건으로 견적 받기
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
}

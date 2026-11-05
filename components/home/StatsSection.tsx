"use client";

import { useEffect, useRef, useState } from "react";
import { YEARS_OF_EXPERIENCE } from "@/lib/constants";

function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const startTime = performance.now();
        const duration = 1800;
        const tick = (now: number) => {
          const p = Math.min((now - startTime) / duration, 1);
          const ease = 1 - (1 - p) ** 3; // cubic ease-out
          setDisplay(Math.round(ease * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { rootMargin: "-80px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{format ? format(display) : display.toLocaleString()}</span>;
}

// 2026-11 수치 정리: 협력 학교는 회사소개서(2026)의 "누적 협력 학교 1,500개 이상"으로 회사 소개 페이지와 맞추고,
// 근거 자료가 없던 "누적 참가 인원 3만+", "안전 운영 100%"는 확인할 수 있는 값(운영 프로그램 수·수상)으로 바꿨다.
type Stat = { label: string; sub: string } & ({ value: number; suffix: string } | { text: string });

function buildStats(programCount: number | null): Stat[] {
  return [
    { value: YEARS_OF_EXPERIENCE, suffix: "년+", label: "교육여행 업력", sub: "1996년 창립" },
    { value: 1500, suffix: "+", label: "누적 협력 학교", sub: "전국 초·중·고 및 대학" },
    programCount
      ? { value: programCount, suffix: "개", label: "운영 중인 프로그램", sub: "국내·해외 교육여행부터 교직원 연수까지" }
      : { text: "8개 분야", label: "운영 프로그램", sub: "국내·해외 교육여행부터 교직원 연수까지" },
    { text: "2025", label: "인천시장상 수상", sub: "교육여행 부문" },
  ];
}

export function StatsSection({ programCount }: { programCount: number | null }) {
  const stats = buildStats(programCount);
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-green-primary tabular-nums">
                {"text" in stat ? (
                  stat.text
                ) : (
                  <>
                    <AnimatedNumber value={stat.value} />
                    {stat.suffix}
                  </>
                )}
              </div>
              <div className="mt-2 text-sm sm:text-base font-medium text-text-dark">{stat.label}</div>
              <div className="mt-0.5 text-xs text-text-gray">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

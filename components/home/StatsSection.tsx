"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return controls.stop;
  }, [isInView, value]);

  return <span ref={ref}>{format ? format(display) : display.toLocaleString()}</span>;
}

const STATS = [
  {
    value: 30,
    suffix: "년+",
    label: "교육여행 업력",
    sub: "1996년 창립",
  },
  {
    value: 500,
    suffix: "+",
    label: "협력 학교",
    sub: "전국 초·중·고 및 대학",
  },
  {
    value: 30000,
    suffix: "+",
    label: "누적 참가 인원",
    sub: "안전하게 함께한 학생들",
    format: (n: number) => (n >= 10000 ? `${Math.floor(n / 10000)}만` : n.toLocaleString()),
  },
  {
    value: 100,
    suffix: "%",
    label: "안전 운영",
    sub: "무사고 현장 운영",
  },
];

export function StatsSection() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-green-primary tabular-nums">
                <AnimatedNumber value={stat.value} format={stat.format} />
                {stat.suffix}
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

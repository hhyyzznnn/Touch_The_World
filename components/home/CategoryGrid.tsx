"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { useState } from "react";

const categoryDescriptions = [
  "국내·해외 교육 목적지를 맞춤 설계합니다",
  "교과 연계 체험으로 학습 효과를 높입니다",
  "자연 속 협동·자립심 훈련 프로그램입니다",
  "교원 역량 강화를 위한 전문 연수입니다",
  "글로벌 진로를 위한 해외 경험을 지원합니다",
  "지역 상생·인재 양성 사업을 운영합니다",
  "취업 연계 현장 실습 프로그램입니다",
  "기관 맞춤형 다양한 교육을 제안합니다",
];

export function CategoryGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
      {PROGRAM_CATEGORIES.map((category, index) => {
        const Icon = category.icon;
        const isHovered = hoveredIndex === index;

        return (
          <Link
            key={category.name}
            href={category.href}
            className="focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:ring-offset-2 rounded-xl"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <motion.div
              className="flex flex-col items-center justify-center px-4 py-5 sm:py-6 rounded-xl min-h-[152px] sm:min-h-[168px]"
              animate={{
                backgroundColor: isHovered ? "#2E6D45" : "#ffffff",
                y: isHovered ? -4 : 0,
                boxShadow: isHovered
                  ? "0 16px 36px -8px rgba(46,109,69,0.35)"
                  : "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.08)",
              }}
              transition={{ duration: 0.22 }}
            >
              {/* 아이콘 원 */}
              <motion.div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3"
                animate={{
                  backgroundColor: isHovered
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,149,75,0.10)",
                }}
                transition={{ duration: 0.22 }}
              >
                <motion.div
                  animate={{ color: isHovered ? "#ffffff" : "#00954B" }}
                  transition={{ duration: 0.18 }}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </motion.div>
              </motion.div>

              {/* 카테고리명 */}
              <motion.span
                className="text-center text-xs sm:text-sm md:text-base leading-snug break-keep whitespace-pre-line font-medium"
                animate={{ color: isHovered ? "#ffffff" : "#1D1D1B" }}
                transition={{ duration: 0.18 }}
              >
                {category.name}
              </motion.span>

              {/* 한 줄 설명 — 항상 DOM에 있고 opacity·y로만 전환 */}
              <motion.p
                className="text-center text-[11px] sm:text-xs leading-snug mt-2 px-1 break-keep"
                style={{ color: "rgba(255,255,255,0.88)" }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 6,
                }}
                transition={{ duration: 0.2, delay: isHovered ? 0.07 : 0 }}
              >
                {categoryDescriptions[index]}
              </motion.p>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

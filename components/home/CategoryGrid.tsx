"use client";

import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { useState } from "react";
import type React from "react";

// 카테고리별 아이콘 keyframe 애니메이션
const iconAnimations: Record<string, number | number[]>[] = [
  // 국내외 교육여행 (MapPin) - 핀 드롭 바운스
  { y: [0, -14, 4, -7, 0] },
  // 체험학습 (BookOpen) - 책 흔들리며 열리기
  { rotate: [0, -14, 14, -7, 0] },
  // 수련활동 (Mountain) - 등반, 위로 상승
  { y: [0, -10, 0], scale: [1, 1.15, 1] },
  // 교사 연수 (GraduationCap) - 졸업 모자 투척
  { y: [0, -16, 0], rotate: [0, 20, -8, 0] },
  // 해외 취업·유학 (Plane) - 우상향 이륙
  { x: [0, 12, 0], y: [0, -10, 0] },
  // 지자체 RISE (Building2) - 빌딩 솟아오름
  { scaleY: [1, 1.22, 1], y: [0, -5, 0] },
  // 특성화고교 (School) - 학교 종 흔들림
  { rotate: [0, -12, 12, -6, 6, 0] },
  // 기타 (MoreHorizontal) - 도트 펄스
  { scale: [1, 1.35, 0.9, 1.05, 1] },
];

const iconTransitions: Transition[] = [
  { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  { duration: 0.5 },
  { duration: 0.6 },
  { duration: 0.7 },
  { duration: 0.65 },
  { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  { duration: 0.55 },
  { duration: 0.48 },
];

// Building2 는 아래서 위로 솟는 느낌을 위해 transformOrigin 조정
const iconStyles: React.CSSProperties[] = [
  {},
  {},
  {},
  {},
  {},
  { transformOrigin: "bottom center" },
  {},
  {},
];

const RESET_STATE = { x: 0, y: 0, rotate: 0, scale: 1, scaleY: 1 };

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
            className="focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:ring-offset-2 rounded-lg"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <motion.div
              className="flex flex-col items-center justify-center px-5 sm:px-7 md:px-9 py-5 sm:py-6 rounded-lg bg-white shadow-sm min-h-[136px] sm:min-h-[140px]"
              whileHover={{
                y: -5,
                backgroundColor: "#f0faf5",
                boxShadow: "0 12px 28px -6px rgba(34, 139, 82, 0.15)",
              }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3"
                animate={isHovered
                  ? { backgroundColor: "rgba(34,139,82,0.18)" }
                  : { backgroundColor: "rgba(34,139,82,0.1)" }
                }
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  style={iconStyles[index]}
                  animate={isHovered ? iconAnimations[index] : RESET_STATE}
                  transition={isHovered ? iconTransitions[index] : { duration: 0.15 }}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-brand-green" />
                </motion.div>
              </motion.div>

              <span
                className="text-center text-text-dark text-xs sm:text-base md:text-lg leading-snug break-keep whitespace-pre-line"
                style={{ fontWeight: 350 }}
              >
                {category.name}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

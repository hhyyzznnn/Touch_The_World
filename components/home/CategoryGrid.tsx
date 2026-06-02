"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
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

const categoryImages = [
  "/images/image1.png",
  "/images/image2.png",
  "/images/image3.png",
  "/images/image4.png",
  "/images/image5.png",
  "/images/image6.png",
  "/images/image7.png",
  "/images/image8_2.png",
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
              className="relative flex flex-col items-center justify-center px-4 rounded-xl h-[176px] overflow-hidden"
              animate={{
                y: isHovered ? -4 : 0,
                boxShadow: isHovered
                  ? "0 16px 36px -8px rgba(46,109,69,0.45)"
                  : "0 1px 3px 0 rgba(0,0,0,0.12)",
              }}
              transition={{ duration: 0.22 }}
            >
              {/* 배경 이미지 */}
              <Image
                src={categoryImages[index]}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
                priority={index < 4}
              />

              {/* 기본 오버레이 (항상) */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: isHovered
                    ? "linear-gradient(to top, rgba(20,65,35,0.88) 0%, rgba(20,65,35,0.72) 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 100%)",
                }}
                transition={{ duration: 0.22 }}
              />

              {/* 콘텐츠 */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                {/* 아이콘 */}
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                  animate={{
                    backgroundColor: isHovered
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.20)",
                  }}
                  transition={{ duration: 0.22 }}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </motion.div>

                {/* 카테고리명 — 2줄 고정 높이로 아이콘 위치 통일 */}
                <span className="flex items-center justify-center h-10 text-center text-xs sm:text-sm md:text-base leading-snug break-keep whitespace-pre-line font-semibold text-white drop-shadow-sm">
                  {category.name}
                </span>

                {/* 설명 — 호버 시 등장 */}
                <motion.p
                  className="text-center text-[11px] sm:text-xs leading-snug px-1 break-keep line-clamp-2 text-white/90"
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    y: isHovered ? 0 : 6,
                  }}
                  transition={{ duration: 0.2, delay: isHovered ? 0.07 : 0 }}
                >
                  {categoryDescriptions[index]}
                </motion.p>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

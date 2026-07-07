"use client";

import Link from "next/link";
import Image from "next/image";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

const CATEGORY_CARDS = [
  {
    name: "국내 교육여행",
    href: "/programs?category=국내교육여행",
    badge: "국내 교육여행",
    title: "국내 곳곳을 누비는\n교육여행",
    description: "제주·경주·포천 등 국내 주요 명소에서 학교 교육 목표에 맞춰 전 일정을 기획·운영합니다.",
    image: "/images/new/category-domestic-edu.webp",
  },
  {
    name: "국외 교육여행",
    href: "/programs?category=국외교육여행",
    badge: "국외 교육여행",
    title: "배움이 넓어지는\n해외 교육여행",
    description: "일본·중국·동남아 등 해외 교육지에서 글로벌 감각을 키우는 맞춤형 수학여행을 기획합니다.",
    image: "/images/new/category-overseas-edu.webp",
  },
  {
    name: "체험학습",
    href: "/programs?category=체험학습",
    badge: "체험학습",
    title: "손으로 배우고 몸으로 느끼는\n현장 체험학습",
    description: "교과와 연계된 농촌·과학·문화 체험으로 교실 밖 살아있는 학습을 경험합니다.",
    image: "/images/new/category-field-learning.webp",
  },
  {
    name: "수련활동",
    href: "/programs?category=수련활동",
    badge: "수련활동",
    title: "자연 속에서 단련하는\n협동과 도전의 힘",
    description: "자연환경에서 팀워크와 자립심을 키우는 협동·도전 프로그램입니다.",
    image: "/images/new/category-training-camp.webp",
  },
  {
    name: "교사 연수",
    href: "/programs?category=교사연수",
    badge: "교사 연수",
    title: "선생님의 성장이\n학생의 미래를 바꿉니다",
    description: "현장 연수와 워크숍으로 교원의 전문성을 강화하는 맞춤형 연수입니다.",
    image: "/images/new/category-teacher-training.webp",
  },
  {
    name: "일본 유학",
    href: "/programs?category=일본유학",
    badge: "일본 유학",
    title: "글로벌 무대로\n나아가는 일본 유학",
    description: "일본 전문학교·대학 입학과 취업 연수로 학생의 글로벌 진로를 지원합니다.",
    image: "/images/new/category-japan-study.webp",
  },
  {
    name: "특성화고 프로그램",
    href: "/programs?category=특성화고교프로그램",
    badge: "특성화고 프로그램",
    title: "현장에서 완성되는\n나만의 직업 역량",
    description: "AI·반도체·수소에너지 등 산업 현장 실습으로 취업 연계 역량을 완성합니다.",
    image: "/images/new/category-vocational.webp",
  },
  {
    name: "기타 프로그램",
    href: "/programs?category=기타프로그램",
    badge: "기타 프로그램",
    title: "우리 학교만을 위한\n맞춤형 프로그램 설계",
    description: "학교·기관의 특성과 목표에 맞춰 완전히 새로운 프로그램을 제안합니다.",
    image: "/images/new/category-custom.webp",
  },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto">
      {CATEGORY_CARDS.map((card, index) => (
        <Link
          key={card.name}
          href={card.href}
          className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          onClick={() => trackEvent(GA_EVENTS.CATEGORY_CLICK, { category: card.name })}
        >
          {/* 상단 이미지 */}
          <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
            {card.image && (
              <Image
                src={card.image}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-[1.07] transition-transform duration-500 ease-out"
                priority={index < 4}
              />
            )}
          </div>

          {/* 하단 텍스트 */}
          <div className="p-3 sm:p-4">
            {/* 배지 */}
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[13px] sm:text-sm font-semibold bg-brand-green-primary text-white mb-2">
              {card.badge}
            </span>

            {/* 제목 */}
            <p className="text-sm sm:text-base font-bold text-text-dark leading-snug whitespace-pre-line mb-1.5">
              {card.title}
            </p>

            {/* 설명 */}
            <p className="text-[11px] sm:text-xs text-text-gray leading-relaxed line-clamp-2 break-keep">
              {card.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

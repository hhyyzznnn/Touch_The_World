"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

interface Achievement {
  id: string;
  institution: string;
  year: number;
  content: string;
}

interface AchievementAccordionProps {
  years: number[];
  grouped: Record<number, Achievement[]>;
  yearLabels?: Record<number, string>;
}

// 실적 문구에서 어떤 종류의 프로그램인지 유추해, 방문자가 "이런 프로그램은 뭐가 있지?"로 바로 이어갈 수 있게 한다.
// 순서 중요: 국외 키워드가 있으면 다른 유형보다 우선한다.
const CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /일본|후쿠오카|동경|도쿄|오사카|싱가포르|대만|독일|체코|해외|국제교류|글로벌/, category: "국외 교육여행" },
  { pattern: /수련활동|리더쉽|리더십/, category: "수련활동" },
  { pattern: /교사연수|교원|수업/, category: "교사 연수" },
  { pattern: /취업|직업|인력양성|특성화|마이스터/, category: "특성화고 프로그램" },
  { pattern: /체험학습|현장학습|탐방/, category: "체험학습" },
];

function getRelatedCategory(achievement: Achievement): string | null {
  const text = `${achievement.institution} ${achievement.content}`;
  return CATEGORY_RULES.find((rule) => rule.pattern.test(text))?.category ?? null;
}

export function AchievementAccordion({ years, grouped, yearLabels }: AchievementAccordionProps) {
  // 기본적으로 최신 연도 2개 열어두기
  const [openYears, setOpenYears] = useState<number[]>(years.slice(0, 2));

  const toggleYear = (year: number) => {
    setOpenYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  return (
    <div className="space-y-4">
      {years.map((year) => {
        const isOpen = openYears.includes(year);
        const achievements = grouped[year];

        return (
          <div key={year} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* 연도 헤더 */}
            <button
              onClick={() => toggleYear(year)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-brand-green-primary">{yearLabels?.[year] || year}</span>
                <span className="text-sm text-text-gray">({achievements.length}건)</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-text-gray transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 실적 목록 */}
            {isOpen && (
              <div className="border-t border-gray-200 bg-gray-50">
                <ul className="divide-y divide-gray-200">
                  {achievements.map((achievement) => {
                    const relatedCategory = getRelatedCategory(achievement);
                    return (
                      <li key={achievement.id} className="px-6 py-4 hover:bg-white transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="font-medium text-text-dark">
                            {achievement.institution}
                          </span>
                          <span className="hidden sm:inline text-text-gray">|</span>
                          <span className="text-text-gray text-sm sm:text-base">
                            {achievement.content}
                          </span>
                          {relatedCategory && (
                            <Link
                              href={`/programs?category=${encodeURIComponent(relatedCategory)}`}
                              className="mt-1 sm:mt-0 sm:ml-auto inline-flex items-center gap-1 text-sm text-brand-green-primary hover:underline flex-shrink-0"
                            >
                              {relatedCategory} 프로그램 보기
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

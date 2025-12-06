"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Achievement {
  id: string;
  institution: string;
  year: number;
  content: string;
}

interface AchievementAccordionProps {
  years: number[];
  grouped: Record<number, Achievement[]>;
}

export function AchievementAccordion({ years, grouped }: AchievementAccordionProps) {
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
                <span className="text-xl font-bold text-brand-green-primary">{year}</span>
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
                  {achievements.map((achievement) => (
                    <li key={achievement.id} className="px-6 py-4 hover:bg-white transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="font-medium text-text-dark">
                          {achievement.institution}
                        </span>
                        <span className="hidden sm:inline text-text-gray">|</span>
                        <span className="text-text-gray text-sm sm:text-base">
                          {achievement.content}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


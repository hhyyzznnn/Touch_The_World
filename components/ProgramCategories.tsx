"use client";

import { useState } from "react";
import Link from "next/link";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { CATEGORY_DETAILS } from "@/lib/category-details";
import { CategoryDetailModal } from "./CategoryDetailModal";
import { getCategoryKey } from "@/lib/category-utils";

export function ProgramCategories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryName: string) => {
    e.preventDefault();
    const categoryKey = getCategoryKey(categoryName);
    if (categoryKey && CATEGORY_DETAILS[categoryKey]) {
      setSelectedCategory(categoryKey);
      setIsModalOpen(true);
    } else {
      // 상세 정보가 없는 경우 기존 링크로 이동
      window.location.href = (e.currentTarget as HTMLAnchorElement).href;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const categoryDetail = selectedCategory ? CATEGORY_DETAILS[selectedCategory] : null;

  return (
    <>
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark mb-6 sm:mb-12 text-center">
            | 프로그램 유형을 선택하세요
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
            {PROGRAM_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const categoryKey = getCategoryKey(category.name);
              const hasDetail = categoryKey && CATEGORY_DETAILS[categoryKey];
              
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={(e) => handleCategoryClick(e, category.name)}
                  className="flex flex-col items-center justify-center px-5 sm:px-7 md:px-9 py-5 sm:py-6 md:py-6 rounded-lg bg-white shadow-sm transform transition-all hover:shadow-md group min-h-[130px] sm:min-h-[140px] cursor-pointer"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 text-brand-green" />
                  </div>
                  <span
                    className="text-center text-text-dark text-xs sm:text-base md:text-lg leading-snug break-keep whitespace-pre-line"
                    style={{ fontWeight: 350 }}
                  >
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CategoryDetailModal
        categoryDetail={categoryDetail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}


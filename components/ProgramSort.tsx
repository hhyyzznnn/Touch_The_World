"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "latest" | "popular" | "rating" | "price_asc" | "price_desc" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "rating", label: "평점순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "name", label: "이름순" },
];

export function ProgramSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams?.get("sort") || "latest") as SortOption;

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (sort === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    // 페이지는 1로 리셋
    params.delete("page");
    router.push(`/programs?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 sm:p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-gray">
        <ArrowUpDown className="h-3.5 w-3.5" />
        정렬 기준
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSortChange(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              currentSort === option.value
                ? "border-brand-green/30 bg-white text-brand-green-primary shadow-sm"
                : "border-transparent bg-transparent text-text-gray hover:border-gray-200 hover:bg-white hover:text-text-dark"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

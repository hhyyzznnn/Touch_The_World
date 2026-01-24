"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-600">정렬:</span>
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentSort === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange(option.value)}
            className={
              currentSort === option.value
                ? "bg-brand-green-primary hover:bg-brand-green-primary/90 text-white"
                : "bg-white border-gray-300 text-text-dark hover:border-brand-green-primary hover:bg-brand-green-primary/5"
            }
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

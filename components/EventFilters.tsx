"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface YearOption {
  value: string;
  label: string;
}

interface EventFiltersProps {
  years: YearOption[];
  categories: string[];
  locations: string[];
}

export function EventFilters({
  years,
  categories,
  locations,
}: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const currentYear = searchParams.get("year") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentLocation = searchParams.get("location") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/events?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("q", searchQuery);
  };

  const clearFilters = () => {
    setSearchQuery("");
    router.push("/events");
  };

  const hasActiveFilters =
    currentYear || currentCategory || currentLocation || searchQuery;

  return (
    <div className="bg-white border rounded-lg p-4 sm:p-6 mb-6">
      <div className="space-y-4">
        {/* 키워드 검색 */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로그램명, 지역 등 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
            />
          </div>
          <Button type="submit" className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white">
            검색
          </Button>
        </form>

        {/* 필터 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 연도 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연도
            </label>
            <select
              value={currentYear}
              onChange={(e) => updateFilter("year", e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
            >
              <option value="">전체</option>
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          {/* 프로그램 종류 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로그램 종류
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
            >
              <option value="">전체</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              지역
            </label>
            <select
              value={currentLocation}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
            >
              <option value="">전체</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 필터 초기화 */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              필터 초기화
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


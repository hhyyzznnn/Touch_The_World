"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { getCategoryKey } from "@/lib/category-utils";
import { resetSearchPaginationParams } from "@/lib/search-params";

interface AdvancedSearchFiltersProps {
  onClose?: () => void;
}

export function AdvancedSearchFilters({ onClose }: AdvancedSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [hashtag, setHashtag] = useState(searchParams.get("hashtag") || "");

  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setRegion(searchParams.get("region") || "");
    setHashtag(searchParams.get("hashtag") || "");
  }, [searchParams]);

  const regions = [
    "서울", "부산", "대구", "인천", "광주", "대전", "울산",
    "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
    "해외"
  ];

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    resetSearchPaginationParams(params);
    
    if (category) params.set("category", category);
    else params.delete("category");
    
    if (region) params.set("region", region);
    else params.delete("region");
    
    if (hashtag) params.set("hashtag", hashtag);
    else params.delete("hashtag");

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
    onClose?.();
  };

  const handleReset = () => {
    setCategory("");
    setRegion("");
    setHashtag("");
    
    const params = new URLSearchParams(searchParams.toString());
    resetSearchPaginationParams(params);
    params.delete("category");
    params.delete("region");
    params.delete("hashtag");
    
    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand-green-primary" />
          고급 검색 필터
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-gray hover:text-text-dark transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          카테고리
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
        >
          <option value="">전체</option>
          {PROGRAM_CATEGORIES.map((cat) => {
            const key = getCategoryKey(cat.name.replace(/\n/g, " ")) || cat.name;
            return (
              <option key={key} value={key}>
                {cat.name.replace(/\n/g, " ")}
              </option>
            );
          })}
        </select>
      </div>

      {/* 지역 */}
      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          지역
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
        >
          <option value="">전체</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 해시태그 */}
      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          해시태그
        </label>
        <input
          type="text"
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
          placeholder="예: 인천, 교사, 특성화고"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleApply}
          className="flex-1 bg-brand-green hover:bg-brand-green/90"
        >
          적용
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex-1"
        >
          초기화
        </Button>
      </div>
    </div>
  );
}

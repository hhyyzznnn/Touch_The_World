"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { getCategoryKey } from "@/lib/category-utils";

interface AdvancedSearchFiltersProps {
  onClose?: () => void;
}

export function AdvancedSearchFilters({ onClose }: AdvancedSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [hashtag, setHashtag] = useState(searchParams.get("hashtag") || "");

  const regions = [
    "서울", "부산", "대구", "인천", "광주", "대전", "울산",
    "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
    "해외"
  ];

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) params.set("category", category);
    else params.delete("category");
    
    if (region) params.set("region", region);
    else params.delete("region");
    
    if (priceMin) params.set("priceMin", priceMin);
    else params.delete("priceMin");
    
    if (priceMax) params.set("priceMax", priceMax);
    else params.delete("priceMax");
    
    if (hashtag) params.set("hashtag", hashtag);
    else params.delete("hashtag");
    
    params.set("page", "1"); // Reset to first page
    
    router.push(`/search?${params.toString()}`);
    onClose?.();
  };

  const handleReset = () => {
    setCategory("");
    setRegion("");
    setPriceMin("");
    setPriceMax("");
    setHashtag("");
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("region");
    params.delete("priceMin");
    params.delete("priceMax");
    params.delete("hashtag");
    
    router.push(`/search?${params.toString()}`);
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

      {/* 가격 범위 */}
      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          가격 범위 (원)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="최소"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          />
          <span className="self-center text-text-gray">~</span>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="최대"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          />
        </div>
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
          placeholder="예: 진주, 통영"
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

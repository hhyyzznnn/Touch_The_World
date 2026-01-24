"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/ProgramCard";
import Link from "next/link";

interface Program {
  id: string;
  title: string;
  category: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  region?: string | null;
  hashtags?: string[];
  priceFrom?: number | null;
  priceTo?: number | null;
  rating?: number | null;
  reviewCount?: number;
  imageUrl?: string | null;
}

interface ProgramCompareProps {
  maxCompare?: number;
}

export function ProgramCompare({ maxCompare = 3 }: ProgramCompareProps) {
  const [compareList, setCompareList] = useState<Program[]>([]);

  useEffect(() => {
    // localStorage에서 비교 목록 불러오기
    const saved = localStorage.getItem("programCompare");
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load compare list:", error);
      }
    }
  }, []);

  useEffect(() => {
    // 비교 목록이 변경될 때마다 localStorage에 저장
    if (compareList.length > 0) {
      localStorage.setItem("programCompare", JSON.stringify(compareList));
    } else {
      localStorage.removeItem("programCompare");
    }
  }, [compareList]);

  const addToCompare = (program: Program) => {
    if (compareList.length >= maxCompare) {
      alert(`최대 ${maxCompare}개까지 비교할 수 있습니다.`);
      return;
    }
    if (compareList.some((p) => p.id === program.id)) {
      alert("이미 비교 목록에 추가된 프로그램입니다.");
      return;
    }
    setCompareList([...compareList, program]);
  };

  const removeFromCompare = (id: string) => {
    setCompareList(compareList.filter((p) => p.id !== id));
  };

  const clearCompare = () => {
    if (confirm("비교 목록을 모두 삭제하시겠습니까?")) {
      setCompareList([]);
    }
  };

  if (compareList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">프로그램 비교</h3>
            <span className="text-sm text-text-gray">
              ({compareList.length}/{maxCompare})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
              aria-label="비교 목록 모두 삭제"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              모두 삭제
            </Button>
            <Link href="/compare">
              <Button size="sm" aria-label="비교하기">
                비교하기
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {compareList.map((program) => (
            <div
              key={program.id}
              className="flex-shrink-0 w-48 relative group"
            >
              <div className="relative">
                <button
                  onClick={() => removeFromCompare(program.id)}
                  className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`${program.title} 비교 목록에서 제거`}
                >
                  <X className="w-4 h-4" />
                </button>
                <ProgramCard
                  id={program.id}
                  title={program.title}
                  category={program.category}
                  summary={program.summary}
                  thumbnailUrl={program.thumbnailUrl}
                  region={program.region}
                  hashtags={program.hashtags}
                  priceFrom={program.priceFrom}
                  priceTo={program.priceTo}
                  rating={program.rating}
                  reviewCount={program.reviewCount}
                  imageUrl={program.imageUrl}
                />
              </div>
            </div>
          ))}
          {compareList.length < maxCompare && (
            <div className="flex-shrink-0 w-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center min-h-[300px]">
              <div className="text-center text-text-gray">
                <Plus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">프로그램 추가</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 비교 기능을 위한 전역 함수 (다른 컴포넌트에서 사용)
export function addToCompareList(program: Program) {
  const saved = localStorage.getItem("programCompare");
  const compareList: Program[] = saved ? JSON.parse(saved) : [];
  
  if (compareList.length >= 3) {
    return { success: false, message: "최대 3개까지 비교할 수 있습니다." };
  }
  if (compareList.some((p) => p.id === program.id)) {
    return { success: false, message: "이미 비교 목록에 추가된 프로그램입니다." };
  }
  
  compareList.push(program);
  localStorage.setItem("programCompare", JSON.stringify(compareList));
  return { success: true, message: "비교 목록에 추가되었습니다." };
}

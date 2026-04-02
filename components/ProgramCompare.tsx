"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/ProgramCard";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import {
  addProgramToCompare,
  CompareProgram,
  DEFAULT_MAX_COMPARE_ITEMS,
  readCompareList,
  writeCompareList,
} from "@/lib/program-compare";

interface ProgramCompareProps {
  maxCompare?: number;
}

export function ProgramCompare({ maxCompare = 3 }: ProgramCompareProps) {
  const toast = useToast();
  const [compareList, setCompareList] = useState<CompareProgram[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    // localStorage에서 비교 목록 불러오기
    setCompareList(readCompareList());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // 비교 목록이 변경될 때마다 localStorage에 저장
    writeCompareList(compareList);
  }, [compareList, initialized]);

  const removeFromCompare = (id: string) => {
    setCompareList(compareList.filter((p) => p.id !== id));
    setShowClearConfirm(false);
  };

  const clearCompare = () => {
    setCompareList([]);
    setShowClearConfirm(false);
    toast.info("비교 목록을 비웠습니다.");
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
            {!showClearConfirm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                aria-label="비교 목록 모두 삭제"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                모두 삭제
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={clearCompare}>
                  삭제 확인
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  취소
                </Button>
              </div>
            )}
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
export function addToCompareList(program: CompareProgram) {
  const result = addProgramToCompare(program, DEFAULT_MAX_COMPARE_ITEMS);
  return { success: result.success, message: result.message };
}

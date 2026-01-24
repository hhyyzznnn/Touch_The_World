"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/ProgramCard";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import Image from "next/image";

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

export function ProgramCompareTable() {
  const router = useRouter();
  const [compareList, setCompareList] = useState<Program[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("programCompare");
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load compare list:", error);
      }
    }
  }, []);

  const removeFromCompare = (id: string) => {
    const updated = compareList.filter((p) => p.id !== id);
    setCompareList(updated);
    if (updated.length > 0) {
      localStorage.setItem("programCompare", JSON.stringify(updated));
    } else {
      localStorage.removeItem("programCompare");
      router.push("/programs");
    }
  };

  const formatPrice = (priceFrom?: number | null, priceTo?: number | null) => {
    if (!priceFrom) return "문의 필요";
    if (priceTo && priceTo !== priceFrom) {
      return `${priceFrom.toLocaleString()}원 ~ ${priceTo.toLocaleString()}원`;
    }
    return `${priceFrom.toLocaleString()}원~`;
  };

  if (compareList.length === 0) {
    return (
      <EmptyState
        icon={<Plus className="w-16 h-16 text-gray-300" />}
        title="비교할 프로그램이 없습니다"
        description="프로그램 목록에서 비교하고 싶은 프로그램을 선택해주세요."
        action={{
          label: "프로그램 보기",
          href: "/programs",
        }}
      />
    );
  }

  const comparisonFields = [
    { label: "카테고리", key: "category" },
    { label: "지역", key: "region" },
    { label: "가격", key: "price" },
    { label: "평점", key: "rating" },
    { label: "후기 수", key: "reviewCount" },
    { label: "요약", key: "summary" },
  ];

  return (
    <div className="space-y-6">
      {/* 비교 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-md">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">
                항목
              </th>
              {compareList.map((program) => (
                <th
                  key={program.id}
                  className="px-4 py-3 text-center text-sm font-semibold text-text-dark min-w-[250px] relative"
                >
                  <button
                    onClick={() => removeFromCompare(program.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    aria-label={`${program.title} 비교 목록에서 제거`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/programs/${program.id}`}
                    className="block hover:text-brand-green-primary transition-colors"
                  >
                    <div className="relative w-full h-32 mb-2 bg-gray-100 rounded-lg overflow-hidden">
                      {program.thumbnailUrl || program.imageUrl ? (
                        <Image
                          src={program.thumbnailUrl || program.imageUrl || ""}
                          alt={program.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="250px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          이미지 없음
                        </div>
                      )}
                    </div>
                    <div className="font-medium line-clamp-2">{program.title}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field) => (
              <tr key={field.key} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium text-text-dark bg-gray-50">
                  {field.label}
                </td>
                {compareList.map((program) => (
                  <td key={program.id} className="px-4 py-3 text-sm text-center">
                    {field.key === "category" && (
                      <span className="text-brand-green-primary">
                        {getCategoryDisplayName(program.category)}
                      </span>
                    )}
                    {field.key === "region" && (
                      <span>{program.region || "전국"}</span>
                    )}
                    {field.key === "price" && (
                      <span className="font-semibold text-brand-green">
                        {formatPrice(program.priceFrom, program.priceTo)}
                      </span>
                    )}
                    {field.key === "rating" && (
                      <span>
                        {program.rating ? program.rating.toFixed(1) : "-"}
                      </span>
                    )}
                    {field.key === "reviewCount" && (
                      <span>{program.reviewCount || 0}개</span>
                    )}
                    {field.key === "summary" && (
                      <span className="text-left line-clamp-2">
                        {program.summary || "-"}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세 비교 버튼 */}
      <div className="flex justify-center gap-4">
        {compareList.map((program) => (
          <Button key={program.id} asChild variant="outline">
            <Link href={`/programs/${program.id}`}>
              {program.title} 상세 보기
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

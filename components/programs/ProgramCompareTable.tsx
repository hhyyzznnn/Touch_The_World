"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import Image from "next/image";
import { parseThumbnailFocus } from "@/lib/thumbnail-focus";
import {
  CompareProgram,
  readCompareList,
  writeCompareList,
} from "@/lib/program-compare";

export function ProgramCompareTable() {
  const router = useRouter();
  const [compareList, setCompareList] = useState<CompareProgram[]>([]);

  useEffect(() => {
    setCompareList(readCompareList());
  }, []);

  const removeFromCompare = (id: string) => {
    const updated = compareList.filter((p) => p.id !== id);
    setCompareList(updated);

    writeCompareList(updated);
    if (updated.length === 0) {
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

  const getFieldValue = (program: CompareProgram, fieldKey: string) => {
    if (fieldKey === "category") {
      return getCategoryDisplayName(program.category);
    }
    if (fieldKey === "region") {
      return program.region || "전국";
    }
    if (fieldKey === "price") {
      return formatPrice(program.priceFrom, program.priceTo);
    }
    if (fieldKey === "rating") {
      return program.rating ? program.rating.toFixed(1) : "-";
    }
    if (fieldKey === "reviewCount") {
      return `${program.reviewCount || 0}개`;
    }
    if (fieldKey === "summary") {
      return program.summary || "-";
    }
    return "-";
  };

  const getThumbnailData = (program: CompareProgram) =>
    parseThumbnailFocus(program.thumbnailUrl || program.imageUrl || null);

  return (
    <div className="space-y-6">
      <div className="space-y-4 md:hidden">
        {compareList.map((program) => {
          const thumbnail = getThumbnailData(program);
          return (
          <article key={program.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative mb-4">
              <button
                onClick={() => removeFromCompare(program.id)}
                className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 text-gray-400 shadow transition-colors hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`${program.title} 비교 목록에서 제거`}
              >
                <X className="h-4 w-4" />
              </button>
              <Link href={`/programs/${program.id}`} className="block">
                <div className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-100">
                  {thumbnail.imageUrl ? (
                    <Image
                      src={thumbnail.imageUrl}
                      alt={program.title}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition: `${thumbnail.focusX}% ${thumbnail.focusY}%`,
                      }}
                      sizes="100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                      이미지 없음
                    </div>
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 text-base font-semibold text-text-dark">{program.title}</h3>
              </Link>
            </div>

            <dl className="space-y-2">
              {comparisonFields.map((field) => (
                <div key={`${program.id}-${field.key}`} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 text-sm last:border-0 last:pb-0">
                  <dt className="text-gray-500">{field.label}</dt>
                  <dd className="max-w-[65%] text-right text-text-dark">
                    {getFieldValue(program, field.key)}
                  </dd>
                </div>
              ))}
            </dl>

            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href={`/programs/${program.id}`}>상세 보기</Link>
            </Button>
          </article>
          );
        })}
      </div>

      {/* 비교 테이블 */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse bg-white rounded-lg shadow-md">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">
                항목
              </th>
              {compareList.map((program) => {
                const thumbnail = getThumbnailData(program);
                return (
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
                      {thumbnail.imageUrl ? (
                        <Image
                          src={thumbnail.imageUrl}
                          alt={program.title}
                          fill
                          className="object-cover"
                          style={{
                            objectPosition: `${thumbnail.focusX}% ${thumbnail.focusY}%`,
                          }}
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
                );
              })}
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
      <div className="hidden justify-center gap-4 md:flex">
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

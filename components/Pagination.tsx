"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string | string[] | undefined>;
  pageParamName?: string; // 페이지 파라미터 이름 (기본값: "page")
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  pageParamName = "page",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // URL 쿼리 파라미터 생성
  const createUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // 기존 검색 파라미터 유지 (페이지 파라미터는 제외)
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === pageParamName) return; // 페이지 파라미터는 제외
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      }
    });
    
    // 페이지 파라미터 추가 (1페이지는 생략 가능)
    if (page > 1) {
      params.set(pageParamName, String(page));
    }
    
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  // 표시할 페이지 번호들 계산
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 최대 표시할 페이지 수
    
    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 첫 페이지
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // 현재 페이지 주변 페이지들
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      // 마지막 페이지
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* 이전 페이지 버튼 */}
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Link href={createUrl(currentPage - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </Button>

      {/* 페이지 번호들 */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-text-gray"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Button
            key={pageNum}
            asChild
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={
              isActive
                ? "bg-brand-green-primary hover:bg-brand-green-primary/90 text-white"
                : "bg-white border-gray-300 text-text-dark hover:border-brand-green-primary hover:bg-brand-green-primary/5"
            }
          >
            <Link href={createUrl(pageNum)}>{pageNum}</Link>
          </Button>
        );
      })}

      {/* 다음 페이지 버튼 */}
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Link href={createUrl(currentPage + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

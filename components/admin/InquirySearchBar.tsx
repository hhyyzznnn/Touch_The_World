"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";

interface Props {
  defaultQ?: string;
  defaultDateFrom?: string;
  defaultDateTo?: string;
}

export function InquirySearchBar({ defaultQ = "", defaultDateFrom = "", defaultDateTo = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qRef = useRef<HTMLInputElement>(null);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  function navigate(overrides: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    const entries: Record<string, string> = {
      q: qRef.current?.value ?? "",
      dateFrom: fromRef.current?.value ?? "",
      dateTo: toRef.current?.value ?? "",
      ...overrides,
    };
    for (const [k, v] of Object.entries(entries)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    router.push(`/admin/inquiries?${p.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") navigate({});
  }

  function clearSearch() {
    if (qRef.current) qRef.current.value = "";
    if (fromRef.current) fromRef.current.value = "";
    if (toRef.current) toRef.current.value = "";
    navigate({ q: "", dateFrom: "", dateTo: "" });
  }

  const hasFilter = defaultQ || defaultDateFrom || defaultDateTo;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* 텍스트 검색 */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          ref={qRef}
          type="text"
          defaultValue={defaultQ}
          placeholder="학교명, 담당자, 연락처 검색…"
          onKeyDown={handleKeyDown}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary/30"
        />
      </div>

      {/* 날짜 범위 */}
      <div className="flex items-center gap-1.5">
        <input
          ref={fromRef}
          type="date"
          defaultValue={defaultDateFrom}
          onChange={() => navigate({})}
          className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-green-primary/30"
        />
        <span className="text-gray-400 text-xs">~</span>
        <input
          ref={toRef}
          type="date"
          defaultValue={defaultDateTo}
          onChange={() => navigate({})}
          className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-green-primary/30"
        />
      </div>

      {/* 검색 버튼 */}
      <button
        onClick={() => navigate({})}
        className="px-3 py-1.5 text-sm font-medium bg-brand-green-primary text-white rounded-md hover:bg-brand-green-primary/90 transition-colors"
      >
        검색
      </button>

      {/* 초기화 */}
      {hasFilter && (
        <button
          onClick={clearSearch}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-3 h-3" />
          초기화
        </button>
      )}
    </div>
  );
}

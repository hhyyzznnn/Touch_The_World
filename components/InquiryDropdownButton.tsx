"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InquiryDropdownButton() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openDropdown() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }

  function scheduleClose() {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={scheduleClose}
    >
      <Button
        asChild
        size="lg"
        variant="outline"
        className="bg-white border-2 border-gray250/50 hover:border-brand-green/50 hover:bg-brand-green/5 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg text-text-dark rounded-xl transition-all duration-200 min-h-11"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex items-center justify-center gap-2 sm:gap-3">
          <Send className="w-4 h-4" />
          문의하기
        </span>
      </Button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden"
          onMouseEnter={openDropdown}
          onMouseLeave={scheduleClose}
        >
          <Link
            href="/inquiry?type=quick"
            className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            onClick={() => setOpen(false)}
          >
            <span className="text-sm font-medium text-text-dark">빠른 문의</span>
            <span className="text-xs text-text-gray mt-0.5">이름·연락처만으로 간단하게</span>
          </Link>
          <Link
            href="/inquiry?type=detailed"
            className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="text-sm font-medium text-text-dark">구체적인 문의</span>
            <span className="text-xs text-text-gray mt-0.5">일정·인원·예산까지 상세 입력</span>
          </Link>
        </div>
      )}
    </div>
  );
}

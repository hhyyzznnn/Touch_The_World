"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusStepper } from "@/components/inquiry/StatusStepper";

interface LookupResult {
  inquiryNumber: string;
  status: string;
  statusLabel: string;
  guide: string;
  schoolName: string;
  createdAt: string;
}

const inputClass =
  "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary";

export function InquiryStatusLookup({ initialNumber }: { initialNumber: string }) {
  const [inquiryNumber, setInquiryNumber] = useState(initialNumber);
  const [contact, setContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/inquiry/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryNumber, contact }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setResult(data);
      }
    } catch {
      setError("조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-medium mb-2">문의 진행 상황 조회</h1>
        <p className="text-text-gray mb-8">
          문의 접수 시 안내받은 접수번호와, 접수할 때 입력한 연락처(전화번호 또는 이메일)를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="inquiryNumber" className="block text-sm font-medium mb-2">
              접수번호
            </label>
            <input
              id="inquiryNumber"
              value={inquiryNumber}
              onChange={(e) => setInquiryNumber(e.target.value)}
              className={inputClass}
              placeholder="예: INQ-CMUY2Q19A0"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <label htmlFor="lookupContact" className="block text-sm font-medium mb-2">
              접수 시 입력한 연락처
            </label>
            <input
              id="lookupContact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={inputClass}
              placeholder="010-1234-5678 또는 example@school.kr"
              required
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full bg-brand-green-primary hover:bg-brand-green-primary/90 text-white"
          >
            {isLoading ? "조회 중..." : "조회하기"}
          </Button>
        </form>

        {error && (
          <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6" aria-live="polite">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-text-dark">{result.schoolName}</p>
              <p className="text-sm text-text-gray">
                {result.inquiryNumber} · {new Date(result.createdAt).toLocaleDateString("ko-KR")} 접수
              </p>
            </div>
            <StatusStepper status={result.status} />
            <p className="mt-5 rounded-md bg-gray-50 px-3 py-2 text-sm text-text-gray">
              현재 상태: <span className="font-medium text-text-dark">{result.statusLabel}</span> — {result.guide}
            </p>
          </div>
        )}

        <p className="mt-8 text-sm text-text-gray">
          급하신 문의는 1800-8078로 연락 주세요.{" "}
          <Link href="/inquiry" className="font-medium text-brand-green-primary underline">
            새 문의하기
          </Link>
        </p>
      </div>
    </div>
  );
}

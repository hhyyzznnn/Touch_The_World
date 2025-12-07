"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 전역 에러 로깅
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">심각한 오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-8">
              애플리케이션에 심각한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={reset} variant="default">
                다시 시도
              </Button>
              <Button asChild variant="outline">
                <Link href="/">홈으로 돌아가기</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


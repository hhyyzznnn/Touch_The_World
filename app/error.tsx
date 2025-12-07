"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 추적 서비스로 전송)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-md mx-auto">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-4xl font-bold mb-4">오류가 발생했습니다</h1>
        <p className="text-gray-600 mb-8">
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded text-left">
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
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
  );
}


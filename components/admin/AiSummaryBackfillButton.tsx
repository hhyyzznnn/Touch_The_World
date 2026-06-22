"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function AiSummaryBackfillButton() {
  const [isRunning, setIsRunning] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleRun = async () => {
    if (!confirm("AI 요약이 없는 문의에 일괄 적용합니다. 계속하시겠습니까?")) return;
    setIsRunning(true);
    try {
      const res = await fetch("/api/admin/inquiries/backfill-ai", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`완료: ${data.updated}건 업데이트 (건너뜀 ${data.skipped}건)`);
        router.refresh();
      } else {
        toast.error(data.error || "실패했습니다.");
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleRun} disabled={isRunning}>
      {isRunning ? "AI 요약 생성 중..." : "AI 요약 일괄 적용"}
    </Button>
  );
}

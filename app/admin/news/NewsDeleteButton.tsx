"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function NewsDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      toast.info("정말 삭제하려면 한 번 더 눌러주세요.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirming(false);
        toast.success("삭제되었습니다.");
        router.refresh();
      } else {
        toast.error("삭제에 실패했습니다.");
      }
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
        {confirming ? "삭제 확인" : "삭제"}
      </Button>
      {confirming && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          취소
        </Button>
      )}
    </div>
  );
}

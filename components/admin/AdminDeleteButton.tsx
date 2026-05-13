"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface AdminDeleteButtonProps {
  endpoint: string;
  confirmMessage?: string;
  errorMessage?: string;
  children?: ReactNode;
}

export function AdminDeleteButton({
  endpoint,
  confirmMessage = "정말 삭제하시겠습니까?",
  errorMessage = "삭제에 실패했습니다.",
  children,
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!isConfirming) {
      setIsConfirming(true);
      toast.info(confirmMessage);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });

      if (!response.ok) {
        let message = errorMessage;
        try {
          const data = await response.json();
          if (typeof data?.error === "string" && data.error.trim()) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parse errors and show fallback message.
        }
        toast.error(message);
        return;
      }

      setIsConfirming(false);
      toast.success("삭제되었습니다.");
      router.refresh();
    } catch {
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "삭제 중..." : isConfirming ? "삭제 확인" : children ?? "삭제"}
      </Button>
      {isConfirming && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
        >
          취소
        </Button>
      )}
    </div>
  );
}

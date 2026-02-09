"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NewsDeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("이 소식을 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
      삭제
    </Button>
  );
}

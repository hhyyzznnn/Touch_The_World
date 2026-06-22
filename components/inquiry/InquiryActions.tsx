"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InquiryDetailModal } from "@/components/inquiry/InquiryDetailModal";
import { Inquiry } from "@/types";
import { InquiryStatusValue } from "@/lib/inquiry-status";
import { useToast } from "@/components/ui/toast";

interface InquiryActionsProps {
  inquiry: Omit<Inquiry, "status"> & { status: string };
}

export function InquiryActions({ inquiry }: InquiryActionsProps) {
  const toast = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState(inquiry);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${currentInquiry.schoolName}" 문의를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${currentInquiry.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("문의가 삭제되었습니다.");
        router.refresh();
      } else {
        toast.error("삭제에 실패했습니다.");
      }
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = (updatedInquiry: Omit<Inquiry, "status"> & { status: string }) => {
    setCurrentInquiry(updatedInquiry);
  };

  const quickTransitionMap: Partial<Record<InquiryStatusValue, { label: string; next: InquiryStatusValue }>> = {
    pending: { label: "검토 시작", next: "reviewing" },
    reviewing: { label: "견적 발송", next: "quoted" },
    quoted: { label: "완료 처리", next: "completed" },
  };

  const quickAction = quickTransitionMap[currentInquiry.status as InquiryStatusValue];

  const handleQuickStatusChange = async () => {
    if (!quickAction || isTransitioning) return;
    setIsTransitioning(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${currentInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: quickAction.next }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentInquiry(data?.inquiry ?? { ...currentInquiry, status: quickAction.next });
        toast.success("상태가 변경되었습니다.");
      } else {
        toast.error("상태 변경에 실패했습니다.");
      }
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
        >
          내용 보기
        </Button>
        {quickAction && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleQuickStatusChange}
            disabled={isTransitioning}
          >
            {isTransitioning ? "처리 중..." : quickAction.label}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 hover:border-red-300"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </Button>
      </div>
      <InquiryDetailModal
        inquiry={currentInquiry}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}

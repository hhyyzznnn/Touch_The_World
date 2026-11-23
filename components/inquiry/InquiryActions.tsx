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
  const [isArchiving, setIsArchiving] = useState(false);
  const isArchived = Boolean(currentInquiry.archivedAt);

  // "삭제"는 실제로 지우지 않고 보관함으로 옮긴다. 보관함에서는 "되돌리기"로 다시 목록에 올린다.
  const handleArchiveToggle = async () => {
    if (!isArchived && !confirm(`"${currentInquiry.schoolName}" 문의를 보관함으로 옮길까요?\n보관함에서 언제든 되돌릴 수 있습니다.`)) return;
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${currentInquiry.id}`, isArchived
        ? { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived: false }) }
        : { method: "DELETE" });
      if (response.ok) {
        toast.success(isArchived ? "문의를 목록으로 되돌렸습니다." : "보관함으로 옮겼습니다.");
        router.refresh();
      } else {
        toast.error(isArchived ? "되돌리지 못했습니다." : "보관하지 못했습니다.");
      }
    } catch {
      toast.error(isArchived ? "되돌리지 못했습니다." : "보관하지 못했습니다.");
    } finally {
      setIsArchiving(false);
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
          onClick={handleArchiveToggle}
          disabled={isArchiving}
          className={isArchived ? "text-brand-green-primary" : "text-gray-500 hover:text-gray-700"}
        >
          {isArchiving ? "처리 중..." : isArchived ? "되돌리기" : "보관"}
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

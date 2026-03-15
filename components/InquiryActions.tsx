"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InquiryDetailModal } from "@/components/InquiryDetailModal";
import { Inquiry } from "@/types";
import { InquiryStatusValue } from "@/lib/inquiry-status";

interface InquiryActionsProps {
  inquiry: Omit<Inquiry, "status"> & { status: string };
}

export function InquiryActions({ inquiry }: InquiryActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState(inquiry);

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
    if (!quickAction) return;
    try {
      const response = await fetch(`/api/admin/inquiries/${currentInquiry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: quickAction.next }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.inquiry) {
          setCurrentInquiry(data.inquiry);
          return;
        }
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating status:", error);
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
          >
            {quickAction.label}
          </Button>
        )}
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

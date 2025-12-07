"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InquiryDetailModal } from "@/components/InquiryDetailModal";

interface Inquiry {
  id: string;
  schoolName: string;
  contact: string;
  phone: string;
  email: string;
  message: string | null;
  status: string;
  createdAt: Date;
}

interface InquiryActionsProps {
  inquiry: Inquiry;
}

export function InquiryActions({ inquiry }: InquiryActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState(inquiry);

  const handleStatusUpdate = (updatedInquiry: Inquiry) => {
    setCurrentInquiry(updatedInquiry);
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
        {currentInquiry.status === "pending" && (
          <form
            action={`/api/admin/inquiries/${currentInquiry.id}`}
            method="POST"
            className="inline"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`/api/admin/inquiries/${currentInquiry.id}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ status: "completed" }),
                });
                if (response.ok) {
                  window.location.reload();
                }
              } catch (error) {
                console.error("Error updating status:", error);
              }
            }}
          >
            <Button type="submit" size="sm" variant="outline">
              완료 처리
            </Button>
          </form>
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


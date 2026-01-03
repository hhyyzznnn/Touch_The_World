"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Inquiry {
  id: string;
  schoolName: string;
  contact: string;
  phone: string;
  email: string;
  message: string | null;
  expectedDate: string | null;
  participantCount: number | null;
  purpose: string | null;
  hasInstructor: boolean | null;
  preferredTransport: string | null;
  mealPreference: string | null;
  specialRequests: string | null;
  estimatedBudget: number | null;
  status: string;
  createdAt: Date;
}

interface InquiryDetailModalProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (inquiry: Inquiry) => void;
}

export function InquiryDetailModal({
  inquiry,
  isOpen,
  onClose,
  onStatusUpdate,
}: InquiryDetailModalProps) {
  const [status, setStatus] = useState(inquiry?.status || "pending");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status);
    }
  }, [inquiry]);

  if (!isOpen || !inquiry) return null;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        if (onStatusUpdate) {
          onStatusUpdate({ ...inquiry, status: newStatus });
        }
        // 페이지 새로고침하여 테이블 업데이트
        window.location.reload();
      } else {
        alert("상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">문의 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">날짜</label>
              <p className="mt-1 text-sm text-gray-900">
                {format(new Date(inquiry.createdAt), "yyyy년 MM월 dd일")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">상태</label>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="pending"
                      checked={status === "pending"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdating}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">대기</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="completed"
                      checked={status === "completed"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdating}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">완료</span>
                  </label>
                </div>
                {isUpdating && (
                  <span className="text-xs text-gray-500">업데이트 중...</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">학교명</label>
            <p className="mt-1 text-sm text-gray-900">{inquiry.schoolName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">담당자</label>
            <p className="mt-1 text-sm text-gray-900">{inquiry.contact}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">전화번호</label>
              <p className="mt-1 text-sm text-gray-900">{inquiry.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">이메일</label>
              <p className="mt-1 text-sm text-gray-900">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-brand-green-primary hover:underline"
                >
                  {inquiry.email}
                </a>
              </p>
            </div>
          </div>

          {/* 프로그램 정보 */}
          {(inquiry.expectedDate || inquiry.participantCount || inquiry.purpose || inquiry.hasInstructor !== null || inquiry.preferredTransport || inquiry.mealPreference || inquiry.estimatedBudget) && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">프로그램 정보</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {inquiry.expectedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">예상 일정</label>
                    <p className="mt-1 text-sm text-gray-900">{inquiry.expectedDate}</p>
                  </div>
                )}
                {inquiry.participantCount && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">예상 인원</label>
                    <p className="mt-1 text-sm text-gray-900">{inquiry.participantCount}명</p>
                  </div>
                )}
              </div>

              {inquiry.purpose && (
                <div>
                  <label className="text-sm font-medium text-gray-500">여행 목적/성격</label>
                  <p className="mt-1 text-sm text-gray-900">{inquiry.purpose}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {inquiry.hasInstructor !== null && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">인솔자 필요 여부</label>
                    <p className="mt-1 text-sm text-gray-900">{inquiry.hasInstructor ? "필요" : "불필요"}</p>
                  </div>
                )}
                {inquiry.preferredTransport && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">선호 이동수단</label>
                    <p className="mt-1 text-sm text-gray-900">{inquiry.preferredTransport}</p>
                  </div>
                )}
              </div>

              {inquiry.mealPreference && (
                <div>
                  <label className="text-sm font-medium text-gray-500">식사 취향/요구사항</label>
                  <p className="mt-1 text-sm text-gray-900">{inquiry.mealPreference}</p>
                </div>
              )}

              {inquiry.estimatedBudget && (
                <div>
                  <label className="text-sm font-medium text-gray-500">예상 예산</label>
                  <p className="mt-1 text-sm text-gray-900">{inquiry.estimatedBudget.toLocaleString()}원</p>
                </div>
              )}
            </div>
          )}

          {inquiry.specialRequests && (
            <div>
              <label className="text-sm font-medium text-gray-500">특별 요구사항</label>
              <div className="mt-1 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{inquiry.specialRequests}</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">기타 문의 내용</label>
            <div className="mt-1 p-4 bg-gray-50 rounded-md min-h-[150px]">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {inquiry.message || "문의 내용이 없습니다."}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}


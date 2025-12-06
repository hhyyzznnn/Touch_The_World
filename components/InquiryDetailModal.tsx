"use client";

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
  status: string;
  createdAt: Date;
}

interface InquiryDetailModalProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryDetailModal({
  inquiry,
  isOpen,
  onClose,
}: InquiryDetailModalProps) {
  if (!isOpen || !inquiry) return null;

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
              <p className="mt-1">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    inquiry.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {inquiry.status === "pending" ? "대기" : "완료"}
                </span>
              </p>
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

          <div>
            <label className="text-sm font-medium text-gray-500">문의 내용</label>
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


"use client";

import Link from "next/link";
import { format } from "date-fns";
import { X, Plus } from "lucide-react";
import type { CalendarItem } from "./CalendarView";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { getCalendarEntryColor } from "@/lib/calendar-colors";

interface CalendarDayModalProps {
  day: Date | null;
  items: CalendarItem[];
  onClose: () => void;
}

export function CalendarDayModal({ day, items, onClose }: CalendarDayModalProps) {
  if (!day) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-medium">{format(day, "yyyy년 M월 d일")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">해당 날짜에 일정이 없습니다.</p>
          ) : (
            items.map((item) => {
              const dotClass =
                item.type === "event"
                  ? "bg-brand-green-primary"
                  : item.type === "inquiry"
                  ? "bg-amber-400"
                  : getCalendarEntryColor(item.color || "gray").dot;
              const typeLabel = item.type === "event" ? "진행 내역" : item.type === "inquiry" ? "예정 문의" : "자유 일정";

              return (
                <div key={item.id} className="flex items-start gap-2">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex-1 block rounded-md border p-3 hover:border-brand-green-primary transition-colors min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                      <span className="text-xs text-gray-400">{typeLabel}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.start}
                      {item.end !== item.start ? ` ~ ${item.end}` : ""}
                    </div>
                  </Link>
                  {item.type === "entry" && (
                    <AdminDeleteButton
                      endpoint={`/api/admin/calendar-entries/${item.id}`}
                      confirmMessage="이 일정을 삭제할까요?"
                    >
                      삭제
                    </AdminDeleteButton>
                  )}
                </div>
              );
            })
          )}
          <Link
            href={`/admin/calendar/entries/new?date=${format(day, "yyyy-MM-dd")}`}
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 rounded-md border border-dashed p-2.5 text-sm text-gray-500 hover:border-brand-green-primary hover:text-brand-green-primary transition-colors"
          >
            <Plus className="w-4 h-4" />이 날짜에 새 일정 추가
          </Link>
        </div>
      </div>
    </div>
  );
}

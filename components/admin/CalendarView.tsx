"use client";

import { useState } from "react";
import { eachDayOfInterval, isSameMonth, isToday, format } from "date-fns";
import { CalendarDayModal } from "./CalendarDayModal";
import { getCalendarEntryColor } from "@/lib/calendar-colors";

export interface CalendarItem {
  id: string;
  type: "event" | "inquiry" | "entry";
  label: string;
  start: string; // yyyy-MM-dd
  end: string; // yyyy-MM-dd (동일하면 단일 날짜)
  href: string;
  status?: string;
  color?: string; // entry 전용
}

interface CalendarViewProps {
  monthStart: Date;
  gridStart: Date;
  gridEnd: Date;
  items: CalendarItem[];
  showInquiryLegend: boolean;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE = 3;

export function CalendarView({ monthStart, gridStart, gridEnd, items, showInquiryLegend }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const itemsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return items.filter((item) => dayStr >= item.start && dayStr <= item.end);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green-primary inline-block" />
          진행 내역
        </span>
        {showInquiryLegend && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            예정 문의
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
          자유 일정
        </span>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-2 text-center text-xs font-medium text-gray-500">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayItems = itemsForDay(day);
            const visible = dayItems.slice(0, MAX_VISIBLE);
            const overflow = dayItems.length - visible.length;
            const inCurrentMonth = isSameMonth(day, monthStart);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`min-h-[92px] border-b border-r last:border-r-0 p-1.5 text-left flex flex-col gap-1 hover:bg-gray-50 cursor-pointer ${
                  inCurrentMonth ? "bg-white" : "bg-gray-50/60"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday(day)
                      ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-green-primary text-white"
                      : inCurrentMonth
                      ? "text-gray-700"
                      : "text-gray-300"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="flex flex-col gap-0.5">
                  {visible.map((item) => (
                    <span
                      key={item.id}
                      className={`truncate rounded px-1 py-0.5 text-[11px] leading-tight ${
                        item.type === "event"
                          ? item.status === "completed"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-green-50 text-brand-green-primary"
                          : item.type === "inquiry"
                          ? "bg-amber-50 text-amber-700"
                          : getCalendarEntryColor(item.color || "gray").badge
                      }`}
                    >
                      {item.label}
                    </span>
                  ))}
                  {overflow > 0 && <span className="text-[11px] text-gray-400">+{overflow}건 더보기</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <CalendarDayModal
        day={selectedDay}
        items={selectedDay ? itemsForDay(selectedDay) : []}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}

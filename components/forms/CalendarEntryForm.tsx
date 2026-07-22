"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CALENDAR_ENTRY_COLORS } from "@/lib/calendar-colors";
import type { CalendarEntry } from "@prisma/client";

interface CalendarEntryFormProps {
  entry?: CalendarEntry;
  prefillDate?: string; // yyyy-MM-dd
}

function toDateInputValue(d: Date) {
  return d.toISOString().split("T")[0];
}

function toDateTimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CalendarEntryForm({ entry, prefillDate }: CalendarEntryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(entry?.title || "");
  const [description, setDescription] = useState(entry?.description || "");
  const [location, setLocation] = useState(entry?.location || "");
  const [color, setColor] = useState(entry?.color || "gray");
  const [allDay, setAllDay] = useState(entry ? entry.allDay : true);
  const [hasEndDate, setHasEndDate] = useState(!!entry?.endDate);

  const [startDate, setStartDate] = useState(() => {
    if (entry) return toDateInputValue(new Date(entry.startDate));
    return prefillDate || "";
  });
  const [startTime, setStartTime] = useState(() =>
    entry && !entry.allDay ? toDateTimeInputValue(new Date(entry.startDate)).slice(11) : "09:00"
  );
  const [endDate, setEndDate] = useState(() =>
    entry?.endDate ? toDateInputValue(new Date(entry.endDate)) : prefillDate || ""
  );
  const [endTime, setEndTime] = useState(() =>
    entry?.endDate && !entry.allDay ? toDateTimeInputValue(new Date(entry.endDate)).slice(11) : "10:00"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const finalStartDate = allDay ? startDate : `${startDate}T${startTime}`;
      const finalEndDate = hasEndDate ? (allDay ? endDate : `${endDate}T${endTime}`) : null;

      const url = entry ? `/api/admin/calendar-entries/${entry.id}` : "/api/admin/calendar-entries";
      const method = entry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          color,
          allDay,
          startDate: finalStartDate,
          endDate: finalEndDate,
        }),
      });

      if (response.ok) {
        router.push("/admin/calendar");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="예: 정기 회의, 출장, 휴가"
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="w-4 h-4 accent-brand-green-primary"
          />
          <span className="text-sm text-gray-700">하루 종일</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">
            시작일 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary bg-white"
              required
            />
            {!allDay && (
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-28 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary bg-white"
                required
              />
            )}
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">종료일</span>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
                className="w-3.5 h-3.5 accent-brand-green-primary"
              />
              기간으로 설정
            </label>
          </label>
          {hasEndDate ? (
            <div className="flex gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary bg-white"
                required
              />
              {!allDay && (
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-28 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary bg-white"
                  required
                />
              )}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400 border rounded-md bg-gray-50">단일 날짜</div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">색상</label>
        <div className="flex flex-wrap gap-3">
          {CALENDAR_ENTRY_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={c.label}
              aria-pressed={color === c.value}
              title={c.label}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${c.dot} ${
                color === c.value
                  ? "ring-2 ring-offset-2 ring-gray-700 scale-110"
                  : "opacity-80 hover:opacity-100 hover:scale-105"
              }`}
            >
              {color === c.value && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">장소</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="장소를 입력하세요 (선택)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary resize-none"
          placeholder="메모나 상세 내용을 적어두세요 (선택)"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-green-primary hover:bg-brand-green-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}

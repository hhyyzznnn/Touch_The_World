"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, X, Upload, Link as LinkIcon } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import type { Event, EventImage, Program } from "@prisma/client";

type EventWithRelations = Event & {
  school: { id: string; name: string };
  program: Program;
  images: EventImage[];
};

interface EventFormProps {
  event?: EventWithRelations;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schoolName, setSchoolName] = useState(event?.school.name || "");
  const [programId, setProgramId] = useState(event?.programId || "");
  const [programName, setProgramName] = useState(event?.program.title || "");
  const [useCustomProgram, setUseCustomProgram] = useState(!event?.programId);
  // 기간 정보 파싱 (notes에서 "기간: YYYY-MM-DD ~ YYYY-MM-DD" 형식 추출)
  const parseDateRange = (notes: string | null) => {
    if (!notes) return { start: "", end: "" };
    const match = notes.match(/기간:\s*(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return { start: match[1], end: match[2] };
    }
    return { start: "", end: "" };
  };

  const eventDateRange = event?.notes ? parseDateRange(event.notes) : { start: "", end: "" };
  const hasDateRange = eventDateRange.start && eventDateRange.end;
  
  const [dateType, setDateType] = useState<"single" | "range">(hasDateRange ? "range" : "single");
  const [date, setDate] = useState(
    event ? new Date(event.date).toISOString().split("T")[0] : ""
  );
  const [startDate, setStartDate] = useState(
    hasDateRange ? eventDateRange.start : (event ? new Date(event.date).toISOString().split("T")[0] : "")
  );
  const [endDate, setEndDate] = useState(hasDateRange ? eventDateRange.end : "");
  const [location, setLocation] = useState(event?.location || "");
  const [studentCount, setStudentCount] = useState(
    event?.studentCount?.toString() || ""
  );
  // content에서 기간 정보 제거
  const cleanContent = (notes: string | null) => {
    if (!notes) return "";
    return notes.replace(/\n기간:\s*\d{4}-\d{2}-\d{2}\s*~\s*\d{4}-\d{2}-\d{2}.*$/, "").trim();
  };

  const [content, setContent] = useState(cleanContent(event?.notes || null));
  const [status, setStatus] = useState<"in_progress" | "completed">(
    (event?.status as "in_progress" | "completed") || "in_progress"
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    event?.images.map((img) => img.url) || []
  );

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetch("/api/admin/programs");
        const data = await res.json();
        setPrograms(data);
      } catch (error) {
        console.error("Failed to load programs:", error);
      }
    }
    loadPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const allImageUrls = imageUrls.filter(Boolean);

      const url = event
        ? `/api/admin/events/${event.id}`
        : "/api/admin/events";
      const method = event ? "PUT" : "POST";

      const finalDate = dateType === "single" ? date : startDate;
      const finalEndDate = dateType === "range" && endDate ? endDate : null;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          programId: useCustomProgram ? null : programId,
          programName: useCustomProgram ? programName : null,
          date: finalDate,
          endDate: finalEndDate,
          location,
          studentCount: studentCount ? parseInt(studentCount) : null,
          content,
          status,
          imageUrls: allImageUrls,
        }),
      });

      if (response.ok) {
        router.push("/admin/events");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const updateImageUrl = (index: number, url: string) => {
    const updated = [...imageUrls];
    updated[index] = url;
    setImageUrls(updated);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <label className="block text-sm font-medium mb-2">
          학교 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="학교명을 입력하세요"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          프로그램 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {useCustomProgram ? (
            <>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="프로그램명을 입력하세요"
                required
              />
              <div className="text-sm text-gray-600">
                또는{" "}
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomProgram(false);
                    setProgramName("");
                  }}
                  className="text-brand-green-primary hover:underline"
                >
                  목록에서 선택하기
                </button>
              </div>
            </>
          ) : (
            <>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary bg-white text-gray-700 appearance-none cursor-pointer"
                style={{ 
                  accentColor: '#2E6D45',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232E6D45' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '12px 12px',
                  paddingRight: '2.5rem'
                }}
                required
              >
                <option value="">프로그램을 선택하세요</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-600">
                또는{" "}
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomProgram(true);
                    setProgramId("");
                  }}
                  className="text-brand-green-primary hover:underline"
                >
                  직접 입력하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          날짜 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dateType"
                value="single"
                checked={dateType === "single"}
                onChange={(e) => setDateType("single")}
                className="w-4 h-4 text-brand-green-primary focus:ring-brand-green-primary accent-brand-green-primary"
                style={{ accentColor: '#2E6D45' }}
              />
              <span className="text-sm text-gray-700">단일 날짜</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dateType"
                value="range"
                checked={dateType === "range"}
                onChange={(e) => setDateType("range")}
                className="w-4 h-4 text-brand-green-primary focus:ring-brand-green-primary accent-brand-green-primary"
                style={{ accentColor: '#2E6D45' }}
              />
              <span className="text-sm text-gray-700">기간</span>
            </label>
          </div>
          {dateType === "single" ? (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary text-gray-700 bg-white"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary text-gray-700 bg-white"
                  placeholder="시작일"
                  required
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary text-gray-700 bg-white"
                  placeholder="종료일"
                  required={dateType === "range"}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">장소</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="장소를 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">학생 수</label>
        <input
          type="number"
          value={studentCount}
          onChange={(e) => setStudentCount(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="학생 수를 입력하세요"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">상태</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="in_progress"
              checked={status === "in_progress"}
              onChange={(e) => setStatus("in_progress")}
              className="w-4 h-4 text-brand-green-primary focus:ring-brand-green-primary accent-brand-green-primary"
              style={{ accentColor: '#2E6D45' }}
            />
            <span className="text-sm text-gray-700">진행 중</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="completed"
              checked={status === "completed"}
              onChange={(e) => setStatus("completed")}
              className="w-4 h-4 text-brand-green-primary focus:ring-brand-green-primary accent-brand-green-primary"
              style={{ accentColor: '#2E6D45' }}
            />
            <span className="text-sm text-gray-700">완료</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary resize-none"
          placeholder="진행 내역에 대한 내용을 작성하세요"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <label className="block text-sm font-medium">이미지</label>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={addImageUrl}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <LinkIcon className="w-4 h-4" />
              URL 추가
            </Button>
            <div className="w-[140px] shrink-0">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    const newUrls = res.map((file) => file.url);
                    setImageUrls([...imageUrls, ...newUrls]);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`업로드 실패: ${error.message}`);
                }}
                appearance={{
                  button: "w-full h-[42px] ut-ready:bg-brand-green-primary ut-uploading:cursor-not-allowed bg-brand-green-primary rounded-md text-white after:bg-brand-green-primary/80",
                  allowedContent: "text-gray-500 text-[11px]",
                }}
                content={{
                  button({ ready }) {
                    return ready ? "파일 선택" : "파일 선택";
                  },
                  allowedContent({ ready }) {
                    return ready ? "이미지(jpg/png/webp) · 최대 4MB" : "";
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* 이미지 URL 목록 */}
        {imageUrls.length > 0 && (
          <div className="space-y-3 mb-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                  placeholder="https://example.com/image.jpg"
                />
                <Button
                  type="button"
                  onClick={() => removeImageUrl(index)}
                  variant="destructive"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="bg-brand-green-primary hover:bg-brand-green-primary/90">
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}

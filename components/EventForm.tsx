"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Event, EventImage, School, Program } from "@prisma/client";

type EventWithRelations = Event & {
  school: School;
  program: Program;
  images: EventImage[];
};

interface EventFormProps {
  event?: EventWithRelations;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schoolId, setSchoolId] = useState(event?.schoolId || "");
  const [programId, setProgramId] = useState(event?.programId || "");
  const [date, setDate] = useState(
    event ? new Date(event.date).toISOString().split("T")[0] : ""
  );
  const [location, setLocation] = useState(event?.location || "");
  const [studentCount, setStudentCount] = useState(
    event?.studentCount.toString() || ""
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    event?.images.map((img) => img.url) || []
  );

  useEffect(() => {
    async function loadData() {
      const [schoolsRes, programsRes] = await Promise.all([
        fetch("/api/admin/schools"),
        fetch("/api/admin/programs"),
      ]);
      const schoolsData = await schoolsRes.json();
      const programsData = await programsRes.json();
      setSchools(schoolsData);
      setPrograms(programsData);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = event
        ? `/api/admin/events/${event.id}`
        : "/api/admin/events";
      const method = event ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          programId,
          date,
          location,
          studentCount: parseInt(studentCount),
          imageUrls,
        }),
      });

      if (response.ok) {
        router.push("/admin/events");
        router.refresh();
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (error) {
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
        <select
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">선택하세요</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          프로그램 <span className="text-red-500">*</span>
        </label>
        <select
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">선택하세요</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          날짜 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          장소 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          학생 수 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={studentCount}
          onChange={(e) => setStudentCount(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          min="1"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium">이미지 URL</label>
          <Button type="button" onClick={addImageUrl} variant="outline" size="sm">
            이미지 추가
          </Button>
        </div>
        <div className="space-y-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-4 items-start">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImageUrl(index, e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                onClick={() => removeImageUrl(index)}
                variant="destructive"
                size="sm"
              >
                삭제
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}


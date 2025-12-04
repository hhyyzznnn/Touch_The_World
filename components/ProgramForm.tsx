"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Program, ProgramImage, ProgramSchedule } from "@prisma/client";

type ProgramWithRelations = Program & {
  images: ProgramImage[];
  schedules: ProgramSchedule[];
};

interface ProgramFormProps {
  program?: ProgramWithRelations;
}

export function ProgramForm({ program }: ProgramFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(program?.title || "");
  const [category, setCategory] = useState(program?.category || "");
  const [summary, setSummary] = useState(program?.summary || "");
  const [description, setDescription] = useState(program?.description || "");
  const [schedules, setSchedules] = useState<
    Array<{ day: number; description: string }>
  >(
    program?.schedules.map((s) => ({
      day: s.day,
      description: s.description,
    })) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = program
        ? `/api/admin/programs/${program.id}`
        : "/api/admin/programs";
      const method = program ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          summary,
          description,
          schedules,
        }),
      });

      if (response.ok) {
        router.push("/admin/programs");
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

  const addSchedule = () => {
    setSchedules([...schedules, { day: schedules.length + 1, description: "" }]);
  };

  const updateSchedule = (index: number, field: "day" | "description", value: string | number) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">요약</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">상세 설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium">일정표</label>
          <Button type="button" onClick={addSchedule} variant="outline" size="sm">
            일정 추가
          </Button>
        </div>
        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div key={index} className="flex gap-4 items-start">
              <input
                type="number"
                value={schedule.day}
                onChange={(e) =>
                  updateSchedule(index, "day", parseInt(e.target.value) || 1)
                }
                className="w-20 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
              />
              <textarea
                value={schedule.description}
                onChange={(e) =>
                  updateSchedule(index, "description", e.target.value)
                }
                rows={3}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="일정 설명"
              />
              <Button
                type="button"
                onClick={() => removeSchedule(index)}
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          취소
        </Button>
      </div>
    </form>
  );
}


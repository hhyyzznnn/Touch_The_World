"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@prisma/client";

interface AchievementFormProps {
  achievement?: Achievement;
}

export function AchievementForm({ achievement }: AchievementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institution, setInstitution] = useState(achievement?.institution || "");
  const [year, setYear] = useState(achievement?.year.toString() || "");
  const [content, setContent] = useState(achievement?.content || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = achievement
        ? `/api/admin/achievements/${achievement.id}`
        : "/api/admin/achievements";
      const method = achievement ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution,
          year: parseInt(year),
          content,
        }),
      });

      if (response.ok) {
        router.push("/admin/achievements");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <label className="block text-sm font-medium mb-2">
          기관명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          연도 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          min="2019"
          max="2030"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
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


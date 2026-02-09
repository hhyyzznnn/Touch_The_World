"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { CompanyNews } from "@prisma/client";

interface CompanyNewsFormProps {
  news?: CompanyNews | null;
}

export function CompanyNewsForm({ news }: CompanyNewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(news?.title ?? "");
  const [summary, setSummary] = useState(news?.summary ?? "");
  const [content, setContent] = useState(news?.content ?? "");
  const [link, setLink] = useState(news?.link ?? "");
  const [isPinned, setIsPinned] = useState(news?.isPinned ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = news
        ? `/api/admin/news/${news.id}`
        : "/api/admin/news";
      const method = news ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary: summary || undefined,
          content: content || undefined,
          link: link || undefined,
          isPinned,
        }),
      });
      if (res.ok) {
        router.push("/admin/news");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "저장에 실패했습니다.");
      }
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
          placeholder="예: 인천관광공사 00상을 수상했습니다."
          required
        />
        <p className="text-xs text-gray-500 mt-1">메인 페이지에 그대로 노출됩니다. &quot;~했습니다.&quot; 형태로 적으면 자연스럽습니다.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">한 줄 요약</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
          placeholder="비워두면 제목이 사용됩니다."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">본문</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
          placeholder="상세 내용 (선택)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">링크 (선택)</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
          placeholder="https://..."
        />
        <p className="text-xs text-gray-500 mt-1">있으면 클릭 시 이 주소로 이동합니다.</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPinned"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="rounded border-gray-300 text-brand-green-primary focus:ring-brand-green-primary"
        />
        <label htmlFor="isPinned" className="text-sm font-medium">
          메인 페이지에 노출 (NEW! 티커)
        </label>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { CompanyNews } from "@prisma/client";

type CompanyNewsWithImages = CompanyNews & {
  imageUrls?: string[];
};

interface CompanyNewsFormProps {
  news?: CompanyNewsWithImages | null;
  redirectPath?: string;
}

function normalizeImageUrls(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CompanyNewsForm({ news, redirectPath = "/admin/news" }: CompanyNewsFormProps) {
  const router = useRouter();
  const toast = useToast();
  const initialImageUrls =
    news?.imageUrls && news.imageUrls.length > 0
      ? news.imageUrls
      : news?.imageUrl
        ? [news.imageUrl]
        : [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(news?.title ?? "");
  const [summary, setSummary] = useState(news?.summary ?? "");
  const [content, setContent] = useState(news?.content ?? "");
  const [link, setLink] = useState(news?.link ?? "");
  const [imageUrl, setImageUrl] = useState(news?.imageUrl ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [isPinned, setIsPinned] = useState(news?.isPinned ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const normalizedImageUrls = imageUrls.map((url) => url.trim()).filter(Boolean);
      const thumbnailUrl = imageUrl.trim() || normalizedImageUrls[0] || "";
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
          imageUrl: thumbnailUrl || null,
          imageUrls: normalizedImageUrls.length > 0 ? normalizedImageUrls : thumbnailUrl ? [thumbnailUrl] : [],
          isPinned,
        }),
      });
      if (res.ok) {
        router.push(redirectPath);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "저장에 실패했습니다.");
      }
    } catch {
      toast.error("저장에 실패했습니다.");
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
          placeholder="예: 교육여행부문 인천시장상 수상"
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
        <label className="block text-sm font-medium mb-2">카드뉴스 썸네일</label>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
              placeholder="https://... 또는 파일 업로드"
            />
            <div className="sm:w-[140px] shrink-0">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  const urls = res?.map((item) => item.url).filter(Boolean) ?? [];
                  if (urls.length > 0) {
                    setImageUrl((current) => current || urls[0]);
                    setImageUrls((current) => [...current, ...urls]);
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`업로드 실패: ${error.message}`);
                }}
                appearance={{
                  button: "w-full h-[42px] ut-ready:bg-brand-green-primary ut-uploading:cursor-not-allowed bg-brand-green-primary rounded-md text-white after:bg-brand-green-primary/80",
                  allowedContent: "text-gray-500 text-[11px]",
                }}
                content={{
                  button() {
                    return "파일 선택";
                  },
                  allowedContent({ ready }) {
                    return ready ? "이미지 최대 10장 · 각 8MB" : "";
                  },
                }}
              />
            </div>
          </div>
          {imageUrl && (
            <div className="rounded-md border bg-gray-50 p-3">
              <div className="relative w-full max-w-[360px] aspect-[4/5] overflow-hidden rounded-md border">
                <Image src={imageUrl} alt="카드뉴스 미리보기" fill className="object-cover" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex-1 truncate text-xs text-gray-600">{imageUrl}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setImageUrl("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500">메인 카드뉴스 영역과 목록에는 이 대표 이미지가 노출됩니다. 비워두면 상세 이미지 첫 장이 썸네일로 사용됩니다.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">상세 카드뉴스 이미지 전체</label>
        <div className="space-y-3">
          <textarea
            value={imageUrls.join("\n")}
            onChange={(e) => setImageUrls(normalizeImageUrls(e.target.value))}
            rows={5}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
            placeholder="상세 페이지에 순서대로 보여줄 이미지 URL을 한 줄에 하나씩 입력하세요."
          />
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imageUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="rounded-md border bg-gray-50 p-2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded border bg-white">
                    <Image src={url} alt={`상세 카드뉴스 ${index + 1}`} fill className="object-cover" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex-1 truncate text-xs text-gray-600">{index + 1}번</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setImageUrls((current) => current.filter((_, i) => i !== index))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">게시물 상세 페이지에는 이 이미지들이 순서대로 모두 노출됩니다.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">링크 (선택, 카카오채널 게시글 URL 권장)</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
          placeholder="https://pf.kakao.com/... 또는 https://..."
        />
        <p className="text-xs text-gray-500 mt-1">
          카카오채널 게시글 URL을 넣으면 홈페이지 카드뉴스 클릭 시 해당 게시글로 이동합니다.
        </p>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import type { ProgramWithRelations } from "@/types";

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
  const [imageUrls, setImageUrls] = useState<string[]>(
    program?.images?.map((img) => img.url) || []
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(program?.thumbnailUrl || "");
  const [showThumbnailInput, setShowThumbnailInput] = useState(!!program?.thumbnailUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const allImageUrls = imageUrls.filter((url) => url.trim() !== "");
      const finalThumbnailUrl = thumbnailUrl.trim() || null;

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
          imageUrls: allImageUrls,
          thumbnailUrl: finalThumbnailUrl,
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

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const addThumbnailUrl = () => {
    setShowThumbnailInput(true);
    if (!thumbnailUrl) {
      setThumbnailUrl("");
    }
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
          <option value="">카테고리를 선택하세요</option>
          <option value="국내외교육여행">국내외 교육여행</option>
          <option value="체험학습">체험학습(숙박형, 비숙박형)</option>
          <option value="수련활동">수련활동</option>
          <option value="교사연수">교사 연수</option>
          <option value="해외취업및유학">해외 취업 및 유학</option>
          <option value="지자체및대학RISE사업">지자체 및 대학 RISE 사업</option>
          <option value="특성화고교프로그램">특성화고교 프로그램</option>
          <option value="기타프로그램">기타 프로그램</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">요약</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">상세 설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">썸네일</label>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              onClick={addThumbnailUrl}
              variant="outline"
              className="h-10 min-h-10 px-4 inline-flex items-center gap-2 shrink-0"
            >
              <LinkIcon className="w-4 h-4" />
              URL 추가
            </Button>
            <UploadButton
              endpoint="thumbnailUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setThumbnailUrl(res[0].url);
                  setShowThumbnailInput(true);
                }
              }}
              onUploadError={(error: Error) => {
                alert(`업로드 실패: ${error.message}`);
              }}
              appearance={{
                button: "h-10 min-h-10 px-4 shrink-0 ut-ready:bg-brand-green-primary ut-uploading:cursor-not-allowed bg-brand-green-primary rounded-md text-white after:bg-brand-green-primary/80",
                allowedContent: "hidden",
              }}
              content={{
                button({ ready }) {
                  return ready ? "파일 선택" : "파일 선택";
                },
              }}
            />
          </div>

          {/* 썸네일 URL 입력 */}
          {showThumbnailInput && (
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                onClick={() => {
                  setThumbnailUrl("");
                  setShowThumbnailInput(false);
                }}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {thumbnailUrl && !showThumbnailInput && (
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
              <span className="flex-1 text-sm text-gray-700 truncate">
                {thumbnailUrl}
              </span>
              <Button
                type="button"
                onClick={() => {
                  setThumbnailUrl("");
                  setShowThumbnailInput(false);
                }}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500">
            권장 사이즈: 1200×800px (16:9 비율), 파일 크기: 4MB 이하
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">이미지</label>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              onClick={addImageUrl}
              variant="outline"
              className="h-10 min-h-10 px-4 inline-flex items-center gap-2 shrink-0"
            >
              <LinkIcon className="w-4 h-4" />
              URL 추가
            </Button>
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
                button: "h-10 min-h-10 px-4 shrink-0 ut-ready:bg-brand-green-primary ut-uploading:cursor-not-allowed bg-brand-green-primary rounded-md text-white after:bg-brand-green-primary/80",
                allowedContent: "hidden",
              }}
              content={{
                button({ ready }) {
                  return ready ? "파일 선택" : "파일 선택";
                },
              }}
            />
          </div>

          {/* 이미지 URL 목록 */}
          {imageUrls.length > 0 && (
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500">
            권장 사이즈: 1920×1080px (Full HD), 파일 크기: 4MB 이하
          </p>
        </div>
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


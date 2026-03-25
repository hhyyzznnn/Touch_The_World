"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, Link as LinkIcon, Sparkles, X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProgramWithRelations } from "@/types";

interface ProgramFormProps {
  program?: ProgramWithRelations;
}

const PROGRAM_DESCRIPTION_TEMPLATE = `## 프로그램 개요
교육 목표와 참가자 특성에 맞춰 운영되는 맞춤형 프로그램입니다.

## 운영 정보
- 운영 기간: 
- 대상: 
- 예상 인원: 
- 지역/장소: 

## 주요 활동
1. 
2. 
3. 

## 포함 사항
- 

## 불포함 사항
- 

## 준비물 및 복장
- 

## 안전/유의사항
- 알러지 및 건강상 유의사항 사전 확인
- 현장 인솔자 안내 사항 준수
`;

function preprocessMarkdown(text: string): string {
  const lines = text.split("\n");
  const processed: string[] = [];

  const keyValuePatterns = [
    "운영 기간:",
    "대상:",
    "예상 인원:",
    "인원:",
    "지역/장소:",
    "장소:",
    "기간:",
    "비용:",
    "가격:",
    "포함 사항:",
    "불포함 사항:",
    "준비물:",
    "유의사항:",
    "문의:",
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    const indent = line.match(/^(\s*)/)?.[1] || "";

    if (trimmed.startsWith("•")) {
      const bulletPoints = trimmed.split(/\s+•\s+/).filter((item) => item.trim());
      if (bulletPoints.length > 1) {
        bulletPoints.forEach((item) => {
          const itemText = item.trim();
          if (itemText) {
            processed.push(`${indent}- ${itemText}`);
          }
        });
      } else {
        processed.push(line.replace(/^(\s*)•\s*/, "$1- "));
      }
      continue;
    }

    const foundPatterns = keyValuePatterns.filter((pattern) => trimmed.includes(pattern));
    if (foundPatterns.length > 1) {
      const positions: Array<{ pattern: string; index: number }> = [];
      foundPatterns.forEach((pattern) => {
        const index = trimmed.indexOf(pattern);
        if (index >= 0) {
          positions.push({ pattern, index });
        }
      });
      positions.sort((a, b) => a.index - b.index);

      positions.forEach((pos, idx) => {
        const start = pos.index;
        const end = idx < positions.length - 1 ? positions[idx + 1].index : trimmed.length;
        const part = trimmed.substring(start, end).trim();
        if (part) {
          processed.push(`${indent}${part}`);
        }
      });
      continue;
    }

    processed.push(line);
  }

  return processed.join("\n");
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

  const insertDescriptionTemplate = () => {
    if (description.includes("## 프로그램 개요")) {
      alert("이미 양식이 삽입되어 있습니다.");
      return;
    }

    if (!description.trim()) {
      setDescription(PROGRAM_DESCRIPTION_TEMPLATE);
      return;
    }

    setDescription((prev) => `${prev.trim()}\n\n${PROGRAM_DESCRIPTION_TEMPLATE}`);
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
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="block text-sm font-medium">상세 설명</label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-3"
            onClick={insertDescriptionTemplate}
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            양식 삽입
          </Button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="프로그램 소개 문구를 입력하세요. 오른쪽 버튼으로 기본 양식을 자동 삽입할 수 있습니다."
        />
        <p className="mt-2 text-xs text-gray-500">
          대표님이 항목별로 작성하기 쉽도록 기본 양식을 제공합니다.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-dark">
          <Eye className="h-4 w-4 text-brand-green-primary" />
          실시간 미리보기
        </div>
        {description.trim() ? (
          <div
            className="prose prose-sm sm:prose-base max-w-none rounded-lg border border-gray-200 bg-white p-4
            prose-headings:text-text-dark prose-headings:font-semibold
            prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-1
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-li:text-gray-700 prose-li:marker:text-brand-green-primary"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {preprocessMarkdown(description)}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
            상세 설명을 입력하면 여기에서 실제 노출 형태를 미리 확인할 수 있습니다.
          </div>
        )}
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

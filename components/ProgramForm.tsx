"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, Link as LinkIcon, Sparkles, X } from "lucide-react";
import { UploadButton, uploadFiles } from "@/lib/uploadthing";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProgramWithRelations } from "@/types";
import { useToast } from "@/components/ui/toast";

interface ProgramFormProps {
  program?: ProgramWithRelations;
}

const THUMBNAIL_ASPECT_RATIO = 16 / 9;
const THUMBNAIL_MIN_WIDTH = 640;
const THUMBNAIL_MIN_HEIGHT = 360;
const THUMBNAIL_MAX_OUTPUT_WIDTH = 1600;
const THUMBNAIL_MAX_ZOOM = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getScale(
  viewportWidth: number,
  viewportHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  zoom: number
): number {
  const coverScale = Math.max(
    viewportWidth / naturalWidth,
    viewportHeight / naturalHeight
  );
  return coverScale * zoom;
}

function clampPan(
  panX: number,
  panY: number,
  viewportWidth: number,
  viewportHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  zoom: number
): { x: number; y: number } {
  const scale = getScale(
    viewportWidth,
    viewportHeight,
    naturalWidth,
    naturalHeight,
    zoom
  );
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;

  const minX = Math.min(0, viewportWidth - renderedWidth);
  const minY = Math.min(0, viewportHeight - renderedHeight);
  const maxX = renderedWidth <= viewportWidth ? minX : 0;
  const maxY = renderedHeight <= viewportHeight ? minY : 0;

  return {
    x: clamp(panX, minX, maxX),
    y: clamp(panY, minY, maxY),
  };
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
  const toast = useToast();
  const thumbnailFileInputRef = useRef<HTMLInputElement | null>(null);
  const cropViewportRef = useRef<HTMLDivElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const uploadActionButtonClass =
    "h-11 min-h-11 w-full px-4 inline-flex items-center justify-center gap-2";
  const uploadPrimaryButtonClass =
    `${uploadActionButtonClass} ut-ready:bg-brand-green-primary ` +
    "ut-uploading:cursor-not-allowed bg-brand-green-primary rounded-md text-white after:bg-brand-green-primary/80";

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
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState("");
  const [cropSourceType, setCropSourceType] = useState("image/jpeg");
  const [cropNaturalWidth, setCropNaturalWidth] = useState(0);
  const [cropNaturalHeight, setCropNaturalHeight] = useState(0);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPanX, setCropPanX] = useState(0);
  const [cropPanY, setCropPanY] = useState(0);
  const [cropWarning, setCropWarning] = useState("");
  const [cropError, setCropError] = useState("");
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const [isDraggingInCrop, setIsDraggingInCrop] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const allImageUrls = imageUrls.filter((url) => url.trim() !== "");
      const normalizedThumbnailUrl = thumbnailUrl.trim();
      const finalThumbnailUrl = normalizedThumbnailUrl || null;

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
        toast.error("저장에 실패했습니다.");
      }
    } catch {
      toast.error("저장에 실패했습니다.");
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
  };

  const clearThumbnail = () => {
    setThumbnailUrl("");
    setShowThumbnailInput(false);
  };

  const closeCropModal = () => {
    setCropModalOpen(false);
    setCropWarning("");
    setCropError("");
    setCropZoom(1);
    setCropPanX(0);
    setCropPanY(0);
    dragRef.current = null;
    setIsDraggingInCrop(false);
    cropImageRef.current = null;
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
      setCropSourceUrl("");
    }
    setCropSourceType("image/jpeg");
    if (thumbnailFileInputRef.current) {
      thumbnailFileInputRef.current.value = "";
    }
  };

  const initializeCropPlacement = (
    naturalWidth: number,
    naturalHeight: number
  ) => {
    const viewport = cropViewportRef.current;
    if (!viewport) return;

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const initialScale = getScale(
      viewportWidth,
      viewportHeight,
      naturalWidth,
      naturalHeight,
      1
    );
    const renderedWidth = naturalWidth * initialScale;
    const renderedHeight = naturalHeight * initialScale;
    setCropPanX((viewportWidth - renderedWidth) / 2);
    setCropPanY((viewportHeight - renderedHeight) / 2);
  };

  const openCropModalFromFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
      setCropSourceUrl("");
    }

    const objectUrl = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      setCropSourceUrl(objectUrl);
      setCropSourceType(file.type || "image/jpeg");
      setCropNaturalWidth(img.naturalWidth);
      setCropNaturalHeight(img.naturalHeight);
      setCropZoom(1);
      setCropError("");
      if (
        img.naturalWidth < THUMBNAIL_MIN_WIDTH ||
        img.naturalHeight < THUMBNAIL_MIN_HEIGHT
      ) {
        setCropWarning(
          `이미지 해상도가 작습니다 (${img.naturalWidth}×${img.naturalHeight}). 결과 품질이 떨어질 수 있습니다.`
        );
      } else {
        setCropWarning("");
      }
      setCropModalOpen(true);
      requestAnimationFrame(() => {
        initializeCropPlacement(img.naturalWidth, img.naturalHeight);
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("이미지를 불러오지 못했습니다.");
    };
    img.src = objectUrl;
  };

  const handleThumbnailFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    openCropModalFromFile(file);
  };

  const updateCropZoom = (nextZoom: number) => {
    const safeZoom = clamp(nextZoom, 1, THUMBNAIL_MAX_ZOOM);
    const viewport = cropViewportRef.current;
    if (!viewport || !cropNaturalWidth || !cropNaturalHeight) {
      setCropZoom(safeZoom);
      return;
    }

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const prevScale = getScale(
      viewportWidth,
      viewportHeight,
      cropNaturalWidth,
      cropNaturalHeight,
      cropZoom
    );
    const nextScale = getScale(
      viewportWidth,
      viewportHeight,
      cropNaturalWidth,
      cropNaturalHeight,
      safeZoom
    );

    const centerImageX = (viewportWidth / 2 - cropPanX) / prevScale;
    const centerImageY = (viewportHeight / 2 - cropPanY) / prevScale;
    const nextPanX = viewportWidth / 2 - centerImageX * nextScale;
    const nextPanY = viewportHeight / 2 - centerImageY * nextScale;
    const clamped = clampPan(
      nextPanX,
      nextPanY,
      viewportWidth,
      viewportHeight,
      cropNaturalWidth,
      cropNaturalHeight,
      safeZoom
    );

    setCropZoom(safeZoom);
    setCropPanX(clamped.x);
    setCropPanY(clamped.y);
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropModalOpen) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: cropPanX,
      startPanY: cropPanY,
    };
    setIsDraggingInCrop(true);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    const viewport = cropViewportRef.current;
    if (!viewport || !cropNaturalWidth || !cropNaturalHeight) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    const nextPanX = dragRef.current.startPanX + deltaX;
    const nextPanY = dragRef.current.startPanY + deltaY;
    const clamped = clampPan(
      nextPanX,
      nextPanY,
      viewport.clientWidth,
      viewport.clientHeight,
      cropNaturalWidth,
      cropNaturalHeight,
      cropZoom
    );

    setCropPanX(clamped.x);
    setCropPanY(clamped.y);
  };

  const handleCropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDraggingInCrop(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const applyCroppedThumbnail = async () => {
    if (!cropImageRef.current || !cropViewportRef.current) {
      setCropError("크롭 준비가 완료되지 않았습니다. 다시 시도해주세요.");
      return;
    }

    setIsApplyingCrop(true);
    setIsUploadingThumbnail(true);
    setCropError("");

    try {
      const viewport = cropViewportRef.current;
      const image = cropImageRef.current;
      if (!cropNaturalWidth || !cropNaturalHeight) {
        throw new Error("이미지 크기 정보를 읽을 수 없습니다.");
      }
      if (!image.complete) {
        await image.decode();
      }
      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;
      const scale = getScale(
        viewportWidth,
        viewportHeight,
        cropNaturalWidth,
        cropNaturalHeight,
        cropZoom
      );

      const sourceX = clamp(-cropPanX / scale, 0, cropNaturalWidth);
      const sourceY = clamp(-cropPanY / scale, 0, cropNaturalHeight);
      const sourceWidth = clamp(
        viewportWidth / scale,
        1,
        cropNaturalWidth - sourceX
      );
      const sourceHeight = clamp(
        viewportHeight / scale,
        1,
        cropNaturalHeight - sourceY
      );

      const outputWidth = Math.max(
        1,
        Math.min(THUMBNAIL_MAX_OUTPUT_WIDTH, Math.round(sourceWidth))
      );
      const outputHeight = Math.max(
        1,
        Math.round(outputWidth / THUMBNAIL_ASPECT_RATIO)
      );

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("캔버스를 생성할 수 없습니다.");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const mimeType = cropSourceType === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, mimeType === "image/jpeg" ? 0.9 : undefined);
      });
      if (!blob) {
        throw new Error("이미지 변환에 실패했습니다.");
      }

      const extension = mimeType === "image/png" ? "png" : "jpg";
      const file = new File([blob], `thumbnail-cropped.${extension}`, {
        type: mimeType,
      });
      const uploaded = await uploadFiles("thumbnailUploader", { files: [file] });
      if (!uploaded?.[0]?.url) {
        throw new Error("업로드 결과를 확인할 수 없습니다.");
      }

      setThumbnailUrl(uploaded[0].url);
      setShowThumbnailInput(true);
      closeCropModal();
      toast.success("썸네일 크롭 및 업로드가 완료되었습니다.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다.";
      setCropError(message);
      toast.error(`썸네일 업로드 실패: ${message}`);
    } finally {
      setIsApplyingCrop(false);
      setIsUploadingThumbnail(false);
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
      toast.info("이미 양식이 삽입되어 있습니다.");
      return;
    }

    if (!description.trim()) {
      setDescription(PROGRAM_DESCRIPTION_TEMPLATE);
      return;
    }

    setDescription((prev) => `${prev.trim()}\n\n${PROGRAM_DESCRIPTION_TEMPLATE}`);
  };

  const cropViewportWidth = cropViewportRef.current?.clientWidth || 0;
  const cropViewportHeight = cropViewportRef.current?.clientHeight || 0;
  const cropScale =
    cropViewportWidth > 0 &&
    cropViewportHeight > 0 &&
    cropNaturalWidth > 0 &&
    cropNaturalHeight > 0
      ? getScale(
          cropViewportWidth,
          cropViewportHeight,
          cropNaturalWidth,
          cropNaturalHeight,
          cropZoom
        )
      : 1;

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
          <div className="grid grid-cols-2 gap-2 items-center">
            <Button
              type="button"
              onClick={addThumbnailUrl}
              variant="outline"
              className={uploadActionButtonClass}
            >
              <LinkIcon className="w-4 h-4" />
              URL 추가
            </Button>
            <Button
              type="button"
              className={uploadPrimaryButtonClass}
              disabled={isUploadingThumbnail}
              onClick={() => thumbnailFileInputRef.current?.click()}
            >
              {isUploadingThumbnail ? "업로드 중..." : "파일 선택"}
            </Button>
          </div>
          <input
            ref={thumbnailFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleThumbnailFileChange}
          />

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
                onClick={clearThumbnail}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {thumbnailUrl && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-medium text-text-dark">최종 업로드 미리보기 (16:9)</p>
              <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-md border border-gray-300 bg-gray-100 aspect-[16/9]">
                <Image
                  src={thumbnailUrl}
                  alt="업로드된 썸네일 미리보기"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            파일 선택 시 먼저 크롭 창이 열리며, 적용한 영역만 업로드됩니다. 권장 비율: 16:9
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">이미지</label>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Button
              type="button"
              onClick={addImageUrl}
              variant="outline"
              className={uploadActionButtonClass}
            >
              <LinkIcon className="w-4 h-4" />
              URL 추가
            </Button>
            <div className="w-full">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    const newUrls = res.map((file) => file.url);
                    setImageUrls([...imageUrls, ...newUrls]);
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`업로드 실패: ${error.message}`);
                }}
                appearance={{
                  button: uploadPrimaryButtonClass,
                  allowedContent: "hidden",
                }}
                content={{
                  button({ ready }) {
                    return ready ? "파일 선택" : "파일 선택";
                  },
                }}
              />
            </div>
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

      {cropModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeCropModal}
        >
          <div
            className="w-full max-w-4xl rounded-xl bg-white p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-text-dark">썸네일 크롭</h3>
                <p className="text-xs text-gray-500">
                  고정 비율 16:9. 드래그로 위치 이동, 슬라이더로 확대/축소 후 적용하세요.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={closeCropModal}
                disabled={isApplyingCrop}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div
                ref={cropViewportRef}
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerCancel={handleCropPointerUp}
                className={`relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg border border-gray-300 bg-gray-100 aspect-[16/9] touch-none ${
                  isDraggingInCrop ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                {cropSourceUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={cropImageRef}
                    src={cropSourceUrl}
                    alt="크롭 대상 이미지"
                    className="absolute left-0 top-0 select-none"
                    style={{
                      width: `${cropNaturalWidth}px`,
                      height: `${cropNaturalHeight}px`,
                      transform: `translate(${cropPanX}px, ${cropPanY}px) scale(${cropScale})`,
                      transformOrigin: "top left",
                      maxWidth: "none",
                    }}
                    draggable={false}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 border border-white/80" />
                <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" />
                <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/70" />
              </div>

              <label className="block text-xs text-gray-600">
                확대/축소 ({cropZoom.toFixed(2)}x)
                <input
                  type="range"
                  min={1}
                  max={THUMBNAIL_MAX_ZOOM}
                  step={0.01}
                  value={cropZoom}
                  onChange={(event) =>
                    updateCropZoom(Number.parseFloat(event.target.value))
                  }
                  className="mt-1 w-full"
                />
              </label>

              {cropWarning && (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {cropWarning}
                </p>
              )}
              {cropError && (
                <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {cropError}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeCropModal}
                disabled={isApplyingCrop}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={applyCroppedThumbnail}
                disabled={isApplyingCrop}
              >
                {isApplyingCrop ? "적용 중..." : "적용"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

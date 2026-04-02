"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { Prisma } from "@prisma/client";
import { useToast } from "@/components/ui/toast";

interface ProductFormProps {
  product?: Prisma.ProductGetPayload<{
    include: {
      images: true;
    };
  }>;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(product?.title || "");
  const [category, setCategory] = useState(product?.category || "camp");
  const [region, setRegion] = useState(product?.region || "");
  const [duration, setDuration] = useState(product?.duration || "");
  const [partner, setPartner] = useState(product?.partner || "");
  const [target, setTarget] = useState(product?.target || "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images?.map((image) => image.url) ||
      (product?.imageUrl ? [product.imageUrl] : [])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const normalizedImageUrls = Array.from(
        new Set(imageUrls.map((url) => url.trim()).filter(Boolean))
      );

      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          region: region || null,
          duration: duration || null,
          partner: partner || null,
          target: target || null,
          description: description || null,
          imageUrls: normalizedImageUrls,
        }),
      });

      if (response.ok) {
        router.push("/admin/products");
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

  const addImageUrl = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div>
        <label className="block text-sm font-medium mb-2">
          상품명 <span className="text-red-500">*</span>
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
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          required
        >
          <option value="camp">교육·학습 캠프</option>
          <option value="culture">문화·예술·체험</option>
          <option value="sports">스포츠 연계</option>
          <option value="study_abroad">해외연수·유학</option>
          <option value="leadership">리더십·인성</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          지역
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
        >
          <option value="">선택 안 함</option>
          <option value="Korea">국내 (Korea)</option>
          <option value="Japan">일본 (Japan)</option>
          <option value="Philippines">필리핀 (Philippines)</option>
          <option value="Global">글로벌 (Global)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          기간
        </label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="예: 4박 5일"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          파트너사
        </label>
        <input
          type="text"
          value={partner}
          onChange={(e) => setPartner(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="협력 기관명"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          대상
        </label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="예: 청소년, 학생, 교사 등"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="상품에 대한 상세 설명을 입력하세요"
        />
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
                  setImageUrls((prev) => [...prev, ...newUrls]);
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`업로드 실패: ${error.message}`);
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

          {imageUrls.length > 0 && (
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2 items-center">
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
            여러 이미지를 한 번에 선택할 수 있습니다. 첫 번째 이미지가 대표 이미지로 표시됩니다.
          </p>
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

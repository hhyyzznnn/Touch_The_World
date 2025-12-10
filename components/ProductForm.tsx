"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import type { Product } from "@prisma/client";

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(product?.title || "");
  const [category, setCategory] = useState(product?.category || "camp");
  const [region, setRegion] = useState(product?.region || "");
  const [duration, setDuration] = useState(product?.duration || "");
  const [partner, setPartner] = useState(product?.partner || "");
  const [target, setTarget] = useState(product?.target || "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalImageUrl = imageUrl.trim() || null;

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
          imageUrl: finalImageUrl,
        }),
      });

      if (response.ok) {
        router.push("/admin/products");
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
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
              placeholder="https://example.com/image.jpg"
            />
            <div className="w-36">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setImageUrl(res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`업로드 실패: ${error.message}`);
                }}
                appearance={{
                  button: "w-full ut-ready:bg-brand-green-primary ut-uploading:cursor-not-allowed bg-brand-green-primary rounded-md text-white after:bg-brand-green-primary/80",
                  allowedContent: "text-gray-500 text-[11px]",
                }}
              />
            </div>
          </div>
          {imageUrl && (
            <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
              <span className="flex-1 text-sm text-gray-700 truncate">
                {imageUrl}
              </span>
              <Button
                type="button"
                onClick={() => setImageUrl("")}
                variant="destructive"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
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


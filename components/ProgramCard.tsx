"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

interface ProgramCardProps {
  id: string;
  title: string;
  category: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  region?: string | null;
  hashtags?: string[];
  priceFrom?: number | null;
  priceTo?: number | null;
  rating?: number | null;
  reviewCount?: number;
  imageUrl?: string | null;
}

export function ProgramCard({
  id,
  title,
  category,
  summary,
  thumbnailUrl,
  region,
  hashtags = [],
  priceFrom,
  priceTo,
  rating,
  reviewCount = 0,
  imageUrl,
}: ProgramCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    // TODO: API 호출로 서버에 저장
  };

  const formatPrice = () => {
    if (!priceFrom) return null;
    if (priceTo && priceTo !== priceFrom) {
      return `${priceFrom.toLocaleString()}원~${priceTo.toLocaleString()}원`;
    }
    return `${priceFrom.toLocaleString()}원~`;
  };

  const displayImage = thumbnailUrl || imageUrl;

  return (
    <Link
      href={`/programs/${id}`}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* 이미지 영역 */}
      <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ImagePlaceholder />
        )}
        
        {/* 좋아요 버튼 */}
        <button
          onClick={handleLikeClick}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all",
            "hover:bg-white hover:scale-110",
            isLiked && "bg-red-50"
          )}
          aria-label="좋아요"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </button>

        {/* 카테고리 배지 */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-brand-green text-white text-xs font-semibold rounded-full shadow-md">
            {category}
          </span>
        </div>
      </div>

      {/* 내용 영역 */}
      <div className="flex-1 p-5 flex flex-col">
        {/* 지역 태그 */}
        {region && (
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-4 h-4 text-brand-green" />
            <span className="text-sm font-medium text-brand-green">{region}</span>
          </div>
        )}

        {/* 해시태그 */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hashtags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 상품명 */}
        <h3 className="text-lg font-bold text-text-dark mb-2 line-clamp-2 group-hover:text-brand-green transition-colors">
          {title}
        </h3>

        {/* 핵심 요약 */}
        {summary && (
          <p className="text-sm text-text-gray mb-3 line-clamp-2 flex-1">
            {summary}
          </p>
        )}

        {/* 평점 & 후기 */}
        {(rating || reviewCount > 0) && (
          <div className="flex items-center gap-2 mb-3">
            {rating && rating > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-text-dark">
                    {rating.toFixed(1)}
                  </span>
                </div>
                {reviewCount > 0 && (
                  <span className="text-xs text-text-gray">
                    ({reviewCount.toLocaleString()})
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* 가격 */}
        {formatPrice() && (
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-brand-green">
                {formatPrice()}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}


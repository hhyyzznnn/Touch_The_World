"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, MapPin } from "lucide-react";
import { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { ShareButton } from "@/components/ShareButton";

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
  const [isLoading, setIsLoading] = useState(false);

  // 초기 좋아요 상태 확인
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/programs/${id}/favorite`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.liked);
        }
      } catch (error) {
        // 로그인하지 않은 경우 무시
        console.error("좋아요 상태 확인 실패:", error);
      }
    };
    checkLikeStatus();
  }, [id]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    const previousLiked = isLiked;

    // 낙관적 업데이트
    setIsLiked(!isLiked);

    try {
      const method = previousLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/programs/${id}/favorite`, {
        method,
      });

      if (!response.ok) {
        const data = await response.json();
        // 실패 시 원래 상태로 복구
        setIsLiked(previousLiked);
        if (response.status === 401) {
          alert("로그인이 필요합니다.");
        } else {
          alert(data.error || "좋아요 처리에 실패했습니다.");
        }
      }
    } catch (error) {
      // 실패 시 원래 상태로 복구
      setIsLiked(previousLiked);
      console.error("좋아요 처리 오류:", error);
      alert("좋아요 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
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
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:ring-offset-2"
      aria-label={`${title} 프로그램 상세 보기`}
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
            loading="lazy"
            decoding="async"
          />
        ) : (
          <ImagePlaceholder />
        )}
        
        {/* 좋아요 버튼 */}
        <button
          onClick={handleLikeClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleLikeClick(e as any);
            }
          }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all",
            "hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:ring-offset-2",
            isLiked && "bg-red-50"
          )}
          aria-label={isLiked ? `${title} 즐겨찾기 해제` : `${title} 즐겨찾기 추가`}
          aria-pressed={isLiked}
          disabled={isLoading}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
            aria-hidden="true"
          />
        </button>

        {/* 카테고리 배지 */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-brand-green text-white text-xs font-semibold rounded-full shadow-md">
            {getCategoryDisplayName(category)}
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

// 메모이제이션으로 불필요한 재렌더링 방지
export default memo(ProgramCard);
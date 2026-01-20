"use client";

import { useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { 
  MapPin,
  BookOpen,
  Mountain, 
  GraduationCap, 
  Plane, 
  Building2, 
  School,
  MoreHorizontal,
  Globe,
  Flag,
  Users,
  Lightbulb,
  Target,
  Briefcase,
  Heart,
  Shield,
  Compass,
  Handshake,
  Award,
  FileText,
  Sparkles,
} from "lucide-react";
import { CategoryDetail, IconName } from "@/lib/category-details";

const iconMap: Record<IconName, LucideIcon> = {
  MapPin,
  BookOpen,
  Mountain,
  GraduationCap,
  Plane,
  Building2,
  School,
  MoreHorizontal,
  Globe,
  Flag,
  Users,
  Lightbulb,
  Target,
  Briefcase,
  Heart,
  Shield,
  Compass,
  Handshake,
  Award,
  FileText,
  Sparkles,
};

interface CategoryDetailModalProps {
  categoryDetail: CategoryDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryDetailModal({
  categoryDetail,
  isOpen,
  onClose,
}: CategoryDetailModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  if (!isOpen || !categoryDetail) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-text-dark mb-1">
              {categoryDetail.title}
            </h2>
            {categoryDetail.subtitle && (
              <p className="text-sm text-text-gray">{categoryDetail.subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-text-gray"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {categoryDetail.description && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <p className="text-sm text-text-dark leading-relaxed">
              {categoryDetail.description}
            </p>
          </div>
        )}

        {/* Cards Container with Scroll */}
        <div className="flex-1 overflow-hidden relative">
          {/* Scroll Buttons */}
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all border border-gray-200"
            aria-label="왼쪽으로 스크롤"
          >
            <ChevronLeft className="w-5 h-5 text-text-dark" />
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all border border-gray-200"
            aria-label="오른쪽으로 스크롤"
          >
            <ChevronRight className="w-5 h-5 text-text-dark" />
          </button>

          {/* Scrollable Cards */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-hidden px-6 py-6 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex gap-4 min-w-max">
              {categoryDetail.cards.map((card) => {
                const Icon = card.icon ? iconMap[card.icon] : null;
                return (
                  <div
                    key={card.id}
                    className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-brand-green/30"
                  >
                    {Icon && (
                      <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-brand-green" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-text-dark mb-2">
                      {card.title}
                    </h3>
                    {card.description && (
                      <p className="text-sm text-text-gray mb-4">
                        {card.description}
                      </p>
                    )}
                    {card.details && card.details.length > 0 && (
                      <ul className="space-y-2">
                        {card.details.map((detail, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-text-dark flex items-start"
                          >
                            <span className="text-brand-green mr-2">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {card.locations && card.locations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-text-gray mb-2">주요 지역:</p>
                        <div className="flex flex-wrap gap-2">
                          {card.locations.map((location, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 rounded text-text-dark"
                            >
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Features (for 수련활동) */}
        {categoryDetail.features && categoryDetail.features.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-center gap-6">
              {categoryDetail.features.map((feature, idx) => {
                const FeatureIcon = iconMap[feature.icon];
                return (
                  <div key={idx} className="flex flex-col items-center">
                    {FeatureIcon && (
                      <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center mb-2">
                        <FeatureIcon className="w-6 h-6 text-brand-green" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-text-dark">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Text & Button */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
          {categoryDetail.bottomText && (
            <p className="text-sm text-text-gray">{categoryDetail.bottomText}</p>
          )}
          {categoryDetail.buttonText && (
            <button
              onClick={() => {
                onClose();
                // TODO: 문의하기 페이지로 이동하거나 채팅 열기
              }}
              className="px-6 py-2 bg-brand-green-primary hover:bg-brand-green-primary/90 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {categoryDetail.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


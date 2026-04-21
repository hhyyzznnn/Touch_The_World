"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  LucideIcon,
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

interface CategoryCardNewsProps {
  categoryDetail: CategoryDetail;
  images: string[];
}

export function CategoryCardNews({ categoryDetail, images }: CategoryCardNewsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hasInitialCenteredRef = useRef(false);
  const [edgePadding, setEdgePadding] = useState(0);
  const hasImageSlides = images.length > 0;

  const updateLayout = useCallback((forceScrollToStart = false) => {
    const container = scrollRef.current;
    const track = trackRef.current;
    if (!container || !track || images.length === 0) return;

    const firstSlide = track.querySelector<HTMLElement>('[data-slide-index="0"]');
    if (!firstSlide) return;

    const calculatedPadding = Math.max(
      0,
      Math.floor((container.clientWidth - firstSlide.clientWidth) / 2)
    );

    setEdgePadding((prev) => (prev === calculatedPadding ? prev : calculatedPadding));

    if (forceScrollToStart || !hasInitialCenteredRef.current) {
      container.scrollTo({ left: 0, behavior: "auto" });
      hasInitialCenteredRef.current = true;
    }
  }, [images.length]);

  useEffect(() => {
    hasInitialCenteredRef.current = false;
    const container = scrollRef.current;
    const track = trackRef.current;
    if (!container || !track || images.length === 0) return;

    const rafId = requestAnimationFrame(() => updateLayout(true));
    const resizeHandler = () => updateLayout(false);
    window.addEventListener("resize", resizeHandler);

    const resizeObserver = new ResizeObserver(() => updateLayout(false));
    resizeObserver.observe(container);
    const firstSlide = track.querySelector<HTMLElement>('[data-slide-index="0"]');
    if (firstSlide) resizeObserver.observe(firstSlide);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeHandler);
      resizeObserver.disconnect();
    };
  }, [images, updateLayout]);

  return (
    <div
      className={
        hasImageSlides
          ? "mb-5 bg-white py-3 border-y border-gray-200"
          : "mb-12 bg-white rounded-2xl py-8"
      }
    >
      <div className="mb-6 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-dark mb-2">
          {categoryDetail.title}
        </h2>
        {categoryDetail.subtitle && (
          <p className="text-base text-text-gray mb-3">{categoryDetail.subtitle}</p>
        )}
        {categoryDetail.description && (
          <p className="text-base text-text-dark leading-relaxed max-w-3xl mx-auto">
            {categoryDetail.description}
          </p>
        )}
      </div>

      {hasImageSlides ? (
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden py-1 scrollbar-hide scroll-smooth"
        >
          <div
            ref={trackRef}
            className="flex gap-4 min-w-max items-center"
            style={{ paddingLeft: edgePadding, paddingRight: edgePadding }}
          >
            {images.map((imageSrc, index) => (
              <div
                key={`${imageSrc}-${index}`}
                data-slide-index={index}
                className="flex-shrink-0 snap-center"
              >
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt={`${categoryDetail.title} 카드뉴스 ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="block h-auto w-auto max-h-[55vh] md:max-h-[480px] max-w-[78vw] md:max-w-[520px] scale-[1.02]"
                    onLoad={() => {
                      if (index === 0) updateLayout(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-hidden px-6 py-4 scrollbar-hide">
          <div className="flex gap-6 min-w-max justify-center">
            {categoryDetail.cards.map((card) => {
              const Icon = card.icon ? iconMap[card.icon] : null;
              return card.image ? (
                <div
                  key={card.id}
                  className="group relative flex-shrink-0 w-80 md:w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-brand-green/50 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 320px, 384px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-4 md:p-5 text-left">
                      <h3 className="text-xl font-semibold text-white whitespace-pre-line">
                        {card.title}
                      </h3>
                      {card.description && (
                        <p className="mt-2 text-sm text-white/90 leading-relaxed whitespace-pre-line">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={card.id}
                  className="flex-shrink-0 w-80 md:w-96 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all hover:border-brand-green/50 flex flex-col items-center text-center"
                >
                  {Icon && (
                    <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-brand-green" />
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-semibold text-text-dark mb-3 whitespace-pre-line">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-base text-text-gray mb-4 leading-relaxed whitespace-pre-line">
                      {card.description}
                    </p>
                  )}
                  {card.details && card.details.length > 0 && (
                    <ul className="space-y-2 w-full">
                      {card.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="text-base text-text-dark flex items-center justify-center"
                        >
                          <span className="text-brand-green mr-2 text-lg">•</span>
                          <span className="flex-1 text-left">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {card.locations && card.locations.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-100 w-full">
                      <p className="text-sm text-text-gray mb-3 font-medium">주요 지역:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {card.locations.map((location, idx) => (
                          <span
                            key={idx}
                            className="text-sm px-3 py-1.5 bg-gray-100 rounded-lg text-text-dark"
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
      )}

      {!hasImageSlides && categoryDetail.features && categoryDetail.features.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 px-6">
          <div className="flex justify-center gap-8 md:gap-12">
            {categoryDetail.features.map((feature, idx) => {
              const FeatureIcon = iconMap[feature.icon];
              return (
                <div key={idx} className="flex flex-col items-center">
                  {FeatureIcon && (
                    <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center mb-3">
                      <FeatureIcon className="w-7 h-7 text-brand-green" />
                    </div>
                  )}
                  <span className="text-base font-medium text-text-dark">
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

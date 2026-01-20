"use client";

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
  LucideIcon
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
}

export function CategoryCardNews({ categoryDetail }: CategoryCardNewsProps) {
  return (
    <div className="mb-12 bg-white rounded-2xl py-8">
      {/* Header */}
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

      {/* Scrollable Cards */}
      <div className="overflow-x-auto overflow-y-hidden px-6 py-4 scrollbar-hide">
        <div className="flex gap-6 min-w-max justify-center">
          {categoryDetail.cards.map((card) => {
            const Icon = card.icon ? iconMap[card.icon] : null;
            return (
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

      {/* Features (for 수련활동) */}
      {categoryDetail.features && categoryDetail.features.length > 0 && (
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


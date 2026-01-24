import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.touchtheworld.co.kr";

  // BreadcrumbList 구조화된 데이터 생성
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: `${baseUrl}/`,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href ? `${baseUrl}${item.href}` : undefined,
      })),
    ],
  };

  return (
    <>
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbList),
        }}
      />
      
      {/* 시각적 Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-text-gray">
          <li>
            <Link
              href="/"
              className="hover:text-brand-green-primary transition-colors flex items-center gap-1"
              aria-label="홈으로 이동"
            >
              <Home className="w-4 h-4" />
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-green-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-dark font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

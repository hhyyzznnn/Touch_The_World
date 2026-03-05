import type { Metadata } from "next";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "교육여행 견적 문의 | 터치더월드",
  description:
    "교육여행, 수학여행, 교사연수, 해외연수 맞춤 견적을 터치더월드에서 빠르게 문의하세요.",
  keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS, ["견적 문의", "상담", "제안 요청"]),
  alternates: {
    canonical: "/inquiry",
  },
};

export default function InquiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


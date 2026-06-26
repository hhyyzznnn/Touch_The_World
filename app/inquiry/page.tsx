import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/InquiryForm";

export const metadata: Metadata = {
  title: "교육여행 견적 문의 | 터치더월드",
  description:
    "수학여행·체험학습·교사연수 등 교육여행 견적을 무료로 문의하세요. 담당자가 24시간 내 맞춤 일정을 안내해드립니다.",
  keywords: ["교육여행 견적", "수학여행 문의", "체험학습 상담", "교사연수 문의", "교육여행 상담"],
  alternates: { canonical: "/inquiry" },
};

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    programRef?: string;
    destination?: string;
    schoolLevel?: string;
    purpose?: string;
  }>;
}) {
  const { type, programRef, destination, schoolLevel, purpose } = await searchParams;
  const initialMode = type === "detailed" ? "detailed" : "quick";
  const presets = programRef || destination || schoolLevel || purpose
    ? { programRef, destination, schoolLevel, purpose }
    : undefined;
  return <InquiryForm initialMode={initialMode} presets={presets} />;
}

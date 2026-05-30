import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/InquiryForm";

// canonical을 페이지에도 명시해 쿼리 파라미터 변형 URL이 중복 페이지로 처리되지 않도록 합니다.
export const metadata: Metadata = {
  alternates: {
    canonical: "/inquiry",
  },
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

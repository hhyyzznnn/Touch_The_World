import type { Metadata } from "next";
import { InquiryStatusLookup } from "@/components/inquiry/InquiryStatusLookup";

export const metadata: Metadata = {
  title: "문의 진행 상황 조회 | 터치더월드",
  robots: { index: false, follow: false },
};

export default async function InquiryStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  const { number } = await searchParams;
  return <InquiryStatusLookup initialNumber={number ?? ""} />;
}

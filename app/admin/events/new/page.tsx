import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// 동적 import로 번들 크기 최적화
const EventForm = dynamic(
  () => import("@/components/forms/EventForm").then((mod) => ({ default: mod.EventForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
);

async function getInquiryPrefill(inquiryId: string) {
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry || !inquiry.departureDate) return undefined;

  return {
    schoolName: inquiry.schoolName,
    date: format(inquiry.departureDate, "yyyy-MM-dd"),
    endDate: inquiry.returnDate ? format(inquiry.returnDate, "yyyy-MM-dd") : undefined,
    location: inquiry.destination || undefined,
    studentCount: inquiry.participantCount || undefined,
    fromInquiryId: inquiry.id,
  };
}

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ fromInquiry?: string }>;
}) {
  const params = await searchParams;
  const prefill = params.fromInquiry ? await getInquiryPrefill(params.fromInquiry) : undefined;

  return (
    <div>
      <h1 className="text-3xl font-medium mb-8">새 진행 내역 추가</h1>
      <EventForm prefill={prefill} />
    </div>
  );
}


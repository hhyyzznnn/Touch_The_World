import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// 동적 import로 번들 크기 최적화
const EventForm = dynamic(
  () => import("@/components/EventForm").then((mod) => ({ default: mod.EventForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
);

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium mb-8">새 진행 내역 추가</h1>
      <EventForm />
    </div>
  );
}


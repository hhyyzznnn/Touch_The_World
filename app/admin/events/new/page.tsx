import { EventForm } from "@/components/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium mb-8">새 진행 내역 추가</h1>
      <EventForm />
    </div>
  );
}


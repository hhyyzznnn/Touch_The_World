import { CalendarEntryForm } from "@/components/forms/CalendarEntryForm";

export default async function NewCalendarEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const prefillDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : undefined;

  return (
    <div>
      <h1 className="text-3xl font-medium mb-8">새 일정 추가</h1>
      <CalendarEntryForm prefillDate={prefillDate} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CalendarEntryForm } from "@/components/forms/CalendarEntryForm";

export default async function EditCalendarEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await prisma.calendarEntry.findUnique({ where: { id } });

  if (!entry) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-medium mb-8">일정 수정</h1>
      <CalendarEntryForm entry={entry} />
    </div>
  );
}

import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, format } from "date-fns";
import { CalendarView, type CalendarItem } from "@/components/admin/CalendarView";

function parseMonthParam(month?: string): Date {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  return new Date();
}

async function getCalendarItems(gridStart: Date, gridEnd: Date, admin: boolean): Promise<CalendarItem[]> {
  const events = await prisma.event.findMany({
    where: {
      date: { lte: gridEnd },
      OR: [{ endDate: { gte: gridStart } }, { endDate: null, date: { gte: gridStart } }],
    },
    include: { school: true, program: true },
    orderBy: { date: "asc" },
  });

  const eventItems: CalendarItem[] = events.map((e) => ({
    id: e.id,
    type: "event",
    label: `${e.school.name} · ${e.program.title}`,
    start: format(e.date, "yyyy-MM-dd"),
    end: format(e.endDate ?? e.date, "yyyy-MM-dd"),
    href: `/admin/events/${e.id}/edit`,
    status: e.status,
  }));

  const inquiryItems: CalendarItem[] = [];
  if (admin) {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        departureDate: { not: null, lte: gridEnd },
        linkedEventId: null,
        OR: [{ returnDate: { gte: gridStart } }, { returnDate: null, departureDate: { gte: gridStart } }],
      },
      orderBy: { departureDate: "asc" },
    });

    inquiryItems.push(
      ...inquiries
        .filter((i): i is typeof i & { departureDate: Date } => i.departureDate !== null)
        .map((i) => ({
          id: i.id,
          type: "inquiry" as const,
          label: `${i.schoolName} (예정 문의)`,
          start: format(i.departureDate, "yyyy-MM-dd"),
          end: format(i.returnDate ?? i.departureDate, "yyyy-MM-dd"),
          href: `/admin/inquiries?q=${encodeURIComponent(i.schoolName)}`,
        }))
    );
  }

  const entries = await prisma.calendarEntry.findMany({
    where: {
      startDate: { lte: gridEnd },
      OR: [{ endDate: { gte: gridStart } }, { endDate: null, startDate: { gte: gridStart } }],
    },
    orderBy: { startDate: "asc" },
  });

  const entryItems: CalendarItem[] = entries.map((e) => ({
    id: e.id,
    type: "entry",
    label: e.title,
    start: format(e.startDate, "yyyy-MM-dd"),
    end: format(e.endDate ?? e.startDate, "yyyy-MM-dd"),
    href: `/admin/calendar/entries/${e.id}/edit`,
    color: e.color,
  }));

  return [...eventItems, ...inquiryItems, ...entryItems];
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const current = parseMonthParam(params.month);
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const admin = await isAdmin();
  const items = await getCalendarItems(gridStart, gridEnd, admin);

  const prevMonth = format(subMonths(monthStart, 1), "yyyy-MM");
  const nextMonth = format(addMonths(monthStart, 1), "yyyy-MM");
  const thisMonth = format(new Date(), "yyyy-MM");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">캘린더</h1>
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-gray-700 mr-2">{format(monthStart, "yyyy년 M월")}</span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/calendar?month=${prevMonth}`} aria-label="이전 달">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/calendar?month=${thisMonth}`}>오늘</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/calendar?month=${nextMonth}`} aria-label="다음 달">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-brand-green-primary hover:bg-brand-green-primary/90 ml-1">
            <Link href="/admin/calendar/entries/new" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              새 일정 추가
            </Link>
          </Button>
        </div>
      </div>

      <CalendarView monthStart={monthStart} gridStart={gridStart} gridEnd={gridEnd} items={items} showInquiryLegend={admin} />

      {!admin && (
        <p className="mt-3 text-xs text-gray-400">예정 문의 일정은 관리자 계정에서만 표시됩니다.</p>
      )}
    </div>
  );
}

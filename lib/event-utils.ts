import { format } from "date-fns";

export function formatEventPeriod(date: Date | string, endDate?: Date | string | null): string {
  const start = new Date(date);
  if (!endDate) return format(start, "yyyy.MM.dd");

  const end = new Date(endDate);
  if (format(start, "yyyy.MM.dd") === format(end, "yyyy.MM.dd")) return format(start, "yyyy.MM.dd");
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "yyyy.MM.dd")} ~ ${format(end, "MM.dd")}`;
  }
  return `${format(start, "yyyy.MM.dd")} ~ ${format(end, "yyyy.MM.dd")}`;
}

export function getEventStatusLabel(status: string): string {
  return status === "completed" ? "진행 완료" : "진행 중";
}

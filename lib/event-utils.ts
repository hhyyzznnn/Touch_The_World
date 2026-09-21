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

type EventWithThumbnail = {
  summaryCardUrl?: string | null;
  images: { url: string }[];
};

// 행사 요약 카드(포스터)가 있으면 그것을 대표 이미지로, 없으면 첫 행사 사진을 쓴다.
export function getEventThumbnailUrl(event: EventWithThumbnail): string | null {
  return event.summaryCardUrl || event.images[0]?.url || null;
}

// 세로로 긴 요약 카드는 위쪽(단체 사진·제목)이 보이도록 위 기준으로 자른다.
export function getEventThumbnailPosition(event: EventWithThumbnail): string {
  return event.summaryCardUrl ? "object-top" : "object-center";
}

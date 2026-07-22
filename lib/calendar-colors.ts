export interface CalendarEntryColorOption {
  value: string;
  label: string;
  badge: string; // 배지/텍스트 배경
  dot: string; // 그리드 점/범례용 단색
}

export const CALENDAR_ENTRY_COLORS: CalendarEntryColorOption[] = [
  { value: "gray", label: "회색", badge: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
  { value: "blue", label: "파랑", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
  { value: "green", label: "초록", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  { value: "amber", label: "노랑", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  { value: "red", label: "빨강", badge: "bg-red-100 text-red-700", dot: "bg-red-400" },
  { value: "purple", label: "보라", badge: "bg-purple-100 text-purple-700", dot: "bg-purple-400" },
];

const COLOR_MAP = new Map(CALENDAR_ENTRY_COLORS.map((c) => [c.value, c]));

export function getCalendarEntryColor(value: string): CalendarEntryColorOption {
  return COLOR_MAP.get(value) ?? CALENDAR_ENTRY_COLORS[0];
}

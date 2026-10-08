export function isRecentlyAdded(createdAt: Date): boolean {
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
}

export function stripBrandFromTitle(title: string): string {
  return title
    .replace(/^\[터치더월드\]\s*/g, "")
    .replace(/^터치더월드\s*[×x]\s*/g, "")
    .replace(/^터치더월드\s+(?![×x])/g, "")
    .replace(/^(\d{4})\s+터치더월드\s+/g, "$1 ")
    .replace(/(\[.+?\])\s+터치더월드\s+/g, "$1 ")
    .replace(/\s*[×x]\s*터치더월드\s*$/gi, "")
    .trim();
}

/** "YYYY-MM-DD" 마감일 입력을 그날의 끝(한국 시간 23:59:59)으로 변환. 비어 있거나 형식이 틀리면 null */
export function parseEndDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const date = new Date(`${value.trim()}T23:59:59+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 저장된 마감일을 한국 시간 기준 "YYYY-MM-DD"로 표시 */
export function formatEndDate(endDate: Date): string {
  return new Date(endDate).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

/** 마감일이 지난 게시물인지 */
export function isEnded(endDate: Date | null | undefined): boolean {
  return !!endDate && new Date(endDate).getTime() < Date.now();
}

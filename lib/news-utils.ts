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

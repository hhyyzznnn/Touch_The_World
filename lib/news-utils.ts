export function isRecentlyAdded(createdAt: Date): boolean {
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
}

export function stripBrandFromTitle(title: string): string {
  return title
    .replace(/^\[?터치더월드\]?\s*[×x\-·|]\s*/i, "")
    .replace(/\s*[×x\-·|]\s*터치더월드\s*$/i, "")
    .trim();
}

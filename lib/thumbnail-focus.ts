const THUMBNAIL_FOCUS_HASH_KEY = "ttw-focus";

export interface ParsedThumbnailFocus {
  imageUrl: string | null;
  focusX: number;
  focusY: number;
}

export function clampFocusPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

function splitHashParams(rawUrl: string): { baseUrl: string; hashParams: URLSearchParams } {
  const [baseUrl, hash = ""] = rawUrl.split("#", 2);
  return { baseUrl, hashParams: new URLSearchParams(hash) };
}

export function parseThumbnailFocus(url: string | null | undefined): ParsedThumbnailFocus {
  if (!url) {
    return {
      imageUrl: null,
      focusX: 50,
      focusY: 50,
    };
  }

  const { baseUrl, hashParams } = splitHashParams(url);
  const rawFocus = hashParams.get(THUMBNAIL_FOCUS_HASH_KEY);

  if (!rawFocus) {
    return {
      imageUrl: url,
      focusX: 50,
      focusY: 50,
    };
  }

  const [xRaw, yRaw] = rawFocus.split(",", 2);
  const focusX = clampFocusPercent(Number.parseInt(xRaw ?? "", 10));
  const focusY = clampFocusPercent(Number.parseInt(yRaw ?? "", 10));
  hashParams.delete(THUMBNAIL_FOCUS_HASH_KEY);

  return {
    imageUrl: hashParams.toString() ? `${baseUrl}#${hashParams.toString()}` : baseUrl,
    focusX,
    focusY,
  };
}

export function buildThumbnailUrlWithFocus(
  imageUrl: string,
  focusX: number,
  focusY: number
): string {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return "";
  }

  const { baseUrl, hashParams } = splitHashParams(trimmed);
  hashParams.set(
    THUMBNAIL_FOCUS_HASH_KEY,
    `${clampFocusPercent(focusX)},${clampFocusPercent(focusY)}`
  );
  return `${baseUrl}#${hashParams.toString()}`;
}

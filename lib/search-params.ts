export const SEARCH_PAGINATION_PARAM_KEYS = [
  "page",
  "programPage",
  "eventPage",
  "schoolPage",
  "achievementPage",
] as const;

export function parsePositivePageParam(value?: string): number {
  if (!value) {
    return 1;
  }

  const page = Number.parseInt(value, 10);
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return page;
}

export function resetSearchPaginationParams(params: URLSearchParams): void {
  for (const key of SEARCH_PAGINATION_PARAM_KEYS) {
    params.delete(key);
  }
}

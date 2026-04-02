export const MAX_FAVORITE_BATCH_IDS = 100;

export function parseFavoriteProgramIds(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  const unique = new Set<string>();

  for (const id of raw.split(",")) {
    const trimmed = id.trim();
    if (!trimmed) {
      continue;
    }

    unique.add(trimmed);
    if (unique.size >= MAX_FAVORITE_BATCH_IDS) {
      break;
    }
  }

  return Array.from(unique);
}

export function buildFavoriteStatusMap(
  requestedProgramIds: string[],
  likedProgramIds: string[]
): Record<string, boolean> {
  const likedSet = new Set(likedProgramIds);
  const statusMap: Record<string, boolean> = {};

  for (const programId of requestedProgramIds) {
    statusMap[programId] = likedSet.has(programId);
  }

  return statusMap;
}

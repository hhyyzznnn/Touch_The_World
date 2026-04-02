"use client";

import { MAX_FAVORITE_BATCH_IDS } from "@/lib/favorites";

const BATCH_DELAY_MS = 20;

const favoriteStatusCache = new Map<string, boolean>();
const queuedIds = new Set<string>();
const pendingResolvers = new Map<string, Array<(liked: boolean) => void>>();
let flushTimer: number | null = null;

function resolveQueued(programId: string, liked: boolean) {
  const resolvers = pendingResolvers.get(programId) ?? [];
  pendingResolvers.delete(programId);
  for (const resolve of resolvers) {
    resolve(liked);
  }
}

async function flushFavoriteStatusBatch() {
  flushTimer = null;
  const ids = Array.from(queuedIds);
  queuedIds.clear();

  if (ids.length === 0 || typeof window === "undefined") {
    return;
  }

  for (let start = 0; start < ids.length; start += MAX_FAVORITE_BATCH_IDS) {
    const lookupIds = ids.slice(start, start + MAX_FAVORITE_BATCH_IDS);

    try {
      const response = await fetch(
        `/api/programs/favorites?ids=${encodeURIComponent(lookupIds.join(","))}`,
        { cache: "no-store" }
      );
      const payload = response.ok
        ? ((await response.json()) as {
            likedByProgramId?: Record<string, boolean>;
          })
        : {};
      const likedByProgramId = payload.likedByProgramId ?? {};

      for (const programId of lookupIds) {
        const liked = Boolean(likedByProgramId[programId]);
        favoriteStatusCache.set(programId, liked);
        resolveQueued(programId, liked);
      }
    } catch {
      for (const programId of lookupIds) {
        const liked = favoriteStatusCache.get(programId) ?? false;
        resolveQueued(programId, liked);
      }
    }
  }
}

function scheduleBatchFlush() {
  if (flushTimer !== null) {
    return;
  }

  flushTimer = window.setTimeout(flushFavoriteStatusBatch, BATCH_DELAY_MS);
}

export function primeFavoriteStatus(programId: string, liked: boolean) {
  favoriteStatusCache.set(programId, liked);
}

export function setFavoriteStatus(programId: string, liked: boolean) {
  favoriteStatusCache.set(programId, liked);
}

export function getFavoriteStatus(programId: string): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  const cached = favoriteStatusCache.get(programId);
  if (typeof cached === "boolean") {
    return Promise.resolve(cached);
  }

  queuedIds.add(programId);
  scheduleBatchFlush();

  return new Promise<boolean>((resolve) => {
    const resolvers = pendingResolvers.get(programId) ?? [];
    resolvers.push(resolve);
    pendingResolvers.set(programId, resolvers);
  });
}

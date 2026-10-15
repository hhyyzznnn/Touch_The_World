"use client";

import { useEffect } from "react";
import { buildTouch, mergeTouch, type Attribution } from "@/lib/attribution";

const STORAGE_KEY = "ttw_attribution";

export function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/**
 * 바깥에서 사이트로 들어온 순간을 기록한다 — 처음 들어온 경로는 계속 유지하고, 마지막 경로는 매번 갱신.
 * 문의 폼이 제출할 때 readAttribution()으로 꺼내 함께 보낸다.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const touch = buildTouch(window.location, document.referrer, window.location.hostname);
      if (!touch) return;
      const next = mergeTouch(readAttribution(), touch);
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장소를 못 쓰는 환경(사생활 보호 모드 등)에서는 기록 없이 진행
    }
  }, []);
  return null;
}

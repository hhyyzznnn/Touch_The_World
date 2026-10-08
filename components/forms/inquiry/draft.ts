import type { InquiryFormData } from "@/lib/inquiry-schema";
import type { InquiryMode } from "./shared";

// 작성 중이던 문의를 브라우저에 임시저장해, 나갔다 돌아와도 이어서 쓸 수 있게 한다.
const DRAFT_STORAGE_KEY = "inquiry-draft-v1";
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7일

export type InquiryDraft = {
  mode: InquiryMode;
  data: Partial<InquiryFormData>;
  savedAt: number;
};

export function readDraft(): InquiryDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InquiryDraft;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS) return null;
    const hasContent = Object.values(parsed.data ?? {}).some((v) =>
      typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null
    );
    return hasContent ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: InquiryDraft) {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 저장 실패(프라이빗 모드 등)는 조용히 무시
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

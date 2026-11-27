"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INQUIRY_SOURCES, MANUAL_RECORD_SOURCES } from "@/lib/inquiry-source";

/** 문의 관리 — 전화·카톡으로 받은 문의를 직접 기록 (app/api/admin/inquiries POST) */
export function ManualInquiryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/admin/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "저장하지 못했습니다.");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-brand-green-primary/40 px-3 py-1.5 text-sm font-medium text-brand-green-primary hover:bg-brand-green-primary/5"
      >
        + 전화·카톡 문의 기록
      </button>
    );
  }

  const input = "h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-brand-green-primary focus:outline-none";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setOpen(false)}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-3 rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">전화·카톡 문의 기록</h2>
        <p className="text-xs text-text-gray">홈페이지 밖에서 받은 문의도 함께 세기 위한 기록입니다. 알림 메일은 가지 않습니다.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            채널
            <select name="source" defaultValue="phone" className={input}>
              {MANUAL_RECORD_SOURCES.map((s) => (
                <option key={s} value={s}>{INQUIRY_SOURCES[s]}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            받은 날
            <input type="date" name="receivedAt" defaultValue={today} className={input} />
          </label>
        </div>
        <label className="block text-sm">
          학교(기관)명 *
          <input name="schoolName" required maxLength={100} className={input} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            담당자
            <input name="contact" maxLength={50} className={input} />
          </label>
          <label className="text-sm">
            연락처
            <input name="phone" maxLength={20} className={input} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            희망 지역
            <input name="destination" maxLength={50} placeholder="예: 제주, 일본" className={input} />
          </label>
          <label className="text-sm">
            인원
            <input name="participantCount" type="number" min={1} className={input} />
          </label>
        </div>
        <label className="block text-sm">
          메모
          <textarea name="message" rows={3} maxLength={2000} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-green-primary focus:outline-none" />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-text-gray hover:bg-gray-100">취소</button>
          <button type="submit" disabled={saving} className="rounded-md bg-brand-green-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "저장 중" : "기록"}
          </button>
        </div>
      </form>
    </div>
  );
}

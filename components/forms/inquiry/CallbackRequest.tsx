"use client";

import { useState } from "react";
import { PhoneCall, CheckCircle2 } from "lucide-react";
import { trackEvent, clarityTag, GA_EVENTS } from "@/lib/gtag";
import { classifyTouch } from "@/lib/attribution";
import { readAttribution } from "@/components/tracking/AttributionCapture";
import { formatPhoneNumber } from "./shared";

/**
 * 전화번호만 남기면 담당자가 연락하는 한 칸 문의 (2026-11-27).
 * 문의 페이지에 온 선생님 대부분이 아무것도 입력하지 않고 나가서, 칸을 하나로 줄인 길을 따로 둔다.
 * 서버에는 callback: true로 보내고 sourceType "callback"으로 저장된다 (app/api/inquiry).
 */
export function CallbackRequest({ context }: { context?: string }) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.replace(/\D/g, "").length < 9) {
      setError("전화번호를 확인해 주세요.");
      return;
    }
    setState("sending");
    const attribution = readAttribution();
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback: true,
          phone,
          message: context ? `${context}\n\n홈페이지에서 전화 상담을 요청하셨습니다.` : undefined,
          attribution,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "잠시 후 다시 시도해 주세요.");
        setState("idle");
        return;
      }
      setState("done");
      clarityTag("inquiry", "submitted");
      trackEvent(GA_EVENTS.INQUIRY_SUBMIT, { inquiry_mode: "callback", first_channel: classifyTouch(attribution?.first) });
    } catch {
      setError("잠시 후 다시 시도해 주세요.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-brand-green-primary/30 bg-brand-green-primary/5 px-4 py-3.5">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-brand-green-primary" aria-hidden />
        <p className="break-keep text-sm text-text-dark">
          요청이 접수되었습니다. 평일 업무 시간 안에 담당자가 전화드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mb-8 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-4">
      <label htmlFor="callback-phone" className="flex items-center gap-2 text-sm font-semibold text-text-dark">
        <PhoneCall className="h-4 w-4 text-brand-green-primary" aria-hidden />
        바쁘시면 번호만 남겨 주세요
      </label>
      <p className="mt-1 break-keep text-xs text-text-gray">담당자가 전화드려 일정과 인원을 여쭙고 견적을 안내해 드립니다.</p>
      <div className="mt-3 flex gap-2">
        <input
          id="callback-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
          className="h-11 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 text-base focus:border-brand-green-primary focus:outline-none focus:ring-2 focus:ring-brand-green-primary/20"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-11 flex-shrink-0 rounded-md bg-brand-green-primary px-4 text-sm font-semibold text-white hover:bg-brand-green-primary/90 disabled:opacity-60"
        >
          {state === "sending" ? "보내는 중" : "연락 요청"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
}

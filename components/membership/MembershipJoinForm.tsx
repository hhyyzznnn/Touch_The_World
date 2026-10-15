"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readAttribution } from "@/components/tracking/AttributionCapture";
import { trackEvent } from "@/lib/gtag";
import { MEMBERSHIP_INTERESTS, MEMBERSHIP_POSITIONS, MEMBERSHIP_SCHOOL_LEVELS } from "@/lib/membership";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-green-primary focus:outline-none focus:ring-1 focus:ring-brand-green-primary";

export function MembershipJoinForm() {
  const [form, setForm] = useState({
    name: "",
    schoolName: "",
    position: "",
    schoolLevel: "",
    email: "",
    phone: "",
    interests: [] as string[],
    pilotInterest: false,
    newsletterOptIn: true,
    privacyConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ updated: boolean } | null>(null);

  const doneRef = useRef<HTMLDivElement>(null);
  // 폼이 짧은 완료 안내로 바뀌면 화면이 아래쪽에 남으므로 안내 위치로 올려준다.
  useEffect(() => {
    if (done) doneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [done]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleInterest = (interest: string) =>
    set("interests", form.interests.includes(interest) ? form.interests.filter((i) => i !== interest) : [...form.interests, interest]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.privacyConsent) {
      setError("개인정보 수집·이용에 동의해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attribution: readAttribution() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      setDone({ updated: !!body.updated });
      trackEvent("membership_join", { pilot_interest: form.pilotInterest, interests: form.interests.join(",") });
    } catch {
      setError("가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div ref={doneRef} className="rounded-2xl border border-brand-green-primary/30 bg-brand-green-primary/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-green-primary" />
        <p className="mt-3 text-lg font-semibold text-text-dark">
          {done.updated ? "가입 정보가 갱신되었습니다" : "멤버십 가입이 완료되었습니다"}
        </p>
        <p className="mt-2 text-sm text-text-gray leading-relaxed">
          {form.newsletterOptIn ? "다음 달 교육여행 소식부터 이메일로 보내드립니다. " : ""}
          {form.pilotInterest ? "시범 운영 대상이 정해지면 따로 연락드리겠습니다." : ""}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium">이름 *</span>
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={50} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">학교(기관)명 *</span>
          <input className={inputClass} value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} required maxLength={100} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">학교급</span>
          <select className={inputClass} value={form.schoolLevel} onChange={(e) => set("schoolLevel", e.target.value)}>
            <option value="">선택</option>
            {MEMBERSHIP_SCHOOL_LEVELS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">직책</span>
          <select className={inputClass} value={form.position} onChange={(e) => set("position", e.target.value)}>
            <option value="">선택</option>
            {MEMBERSHIP_POSITIONS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">이메일 *</span>
          <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} required maxLength={254} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">연락처</span>
          <input type="tel" className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="선택" maxLength={20} />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">관심 있는 혜택 (복수 선택)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEMBERSHIP_INTERESTS.map((interest) => {
            const on = form.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  on ? "border-brand-green-primary bg-brand-green-primary text-white" : "border-gray-300 text-text-gray hover:border-brand-green-primary"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
        <label className="flex items-start gap-2.5">
          <input type="checkbox" className="mt-0.5" checked={form.pilotInterest} onChange={(e) => set("pilotInterest", e.target.checked)} />
          <span>
            <b>플러스·프리미엄 시범 운영에 참여하고 싶어요</b>
            <span className="block text-xs text-text-gray">시범 기간에는 비용 없이 자료실·마감 알림 등을 먼저 써보고 의견을 주시는 방식입니다.</span>
          </span>
        </label>
        <label className="flex items-start gap-2.5">
          <input type="checkbox" className="mt-0.5" checked={form.newsletterOptIn} onChange={(e) => set("newsletterOptIn", e.target.checked)} />
          <span>
            (선택) 월간 교육여행 소식·지원사업 안내 이메일 수신
          </span>
        </label>
        <label className="flex items-start gap-2.5">
          <input type="checkbox" className="mt-0.5" checked={form.privacyConsent} onChange={(e) => set("privacyConsent", e.target.checked)} />
          <span>
            (필수) 개인정보 수집·이용 동의
            <span className="block text-xs text-text-gray leading-relaxed">
              수집 항목: 이름, 학교(기관)명, 학교급, 직책, 이메일, 연락처, 관심 분야 · 목적: 멤버십 혜택 제공과 안내 ·
              보유 기간: 탈퇴 요청 시까지 (요청 시 지체 없이 파기)
            </span>
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-brand-green-primary hover:bg-brand-green-primary/90 text-white">
        {submitting ? "가입 중..." : "무료로 가입하기"}
      </Button>
    </form>
  );
}

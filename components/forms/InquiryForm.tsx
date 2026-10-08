"use client";

import { useState, useRef, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useToast } from "@/components/ui/toast";
import { inquirySchema, type InquiryFormData } from "@/lib/inquiry-schema";
import { CheckCircle2, Bookmark, History, X } from "lucide-react";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";
import { BasicInfoSection } from "./inquiry/BasicInfoSection";
import { ScheduleSection } from "./inquiry/ScheduleSection";
import { TravelSection } from "./inquiry/TravelSection";
import { LodgingSection } from "./inquiry/LodgingSection";
import { ProgramSection } from "./inquiry/ProgramSection";
import { SafetySection } from "./inquiry/SafetySection";
import { clearDraft, readDraft, writeDraft, type InquiryDraft } from "./inquiry/draft";
import { formatPhoneNumber, type InquiryMode } from "./inquiry/shared";

interface InquiryPresets {
  programRef?: string;
  destination?: string;
  schoolLevel?: string;
  purpose?: string;
}

export function InquiryForm({
  initialMode,
  presets,
}: {
  initialMode: InquiryMode;
  presets?: InquiryPresets;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<InquiryMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    inquiryNumber?: string;
    expectedReply?: string;
  } | null>(null);

  const [pendingDraft, setPendingDraft] = useState<InquiryDraft | null>(null);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      destination: presets?.destination ?? "",
      schoolLevel: presets?.schoolLevel ?? "",
      purpose: presets?.purpose ?? "",
      message: presets?.programRef
        ? `'${presets.programRef}' 카드뉴스를 보고 문의드립니다.\n\n`
        : "",
    },
  });
  const { handleSubmit, reset, watch } = form;

  // 이전에 작성하다 만 문의가 있으면 배너로 복구 제안
  useEffect(() => {
    const draft = readDraft();
    if (draft) setPendingDraft(draft);
  }, []);

  // 입력값이 바뀔 때마다 디바운스하여 임시저장 (성공 제출 전까지)
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isSuccess) return;
    const subscription = watch((values) => {
      if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
      draftSaveTimerRef.current = setTimeout(() => {
        const hasContent = Object.values(values).some((v) =>
          typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null
        );
        if (hasContent) {
          writeDraft({ mode, data: values as Partial<InquiryFormData>, savedAt: Date.now() });
        }
      }, 800);
    });
    return () => {
      subscription.unsubscribe();
      if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    };
  }, [watch, mode, isSuccess]);

  const applyDraft = (draft: InquiryDraft) => {
    reset(draft.data);
    setMode(draft.mode);
    setPendingDraft(null);
  };

  const dismissDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        phone: typeof data.phone === "string" ? formatPhoneNumber(data.phone) : data.phone,
        estimatedBudget:
          typeof data.estimatedBudget === "number" ? data.estimatedBudget : undefined,
      };
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitResult({
          inquiryNumber: result?.inquiryNumber,
          expectedReply: result?.expectedReply,
        });
        setIsSuccess(true);
        reset();
        clearDraft();
        toast.success("문의가 접수되었습니다.");
        trackEvent(GA_EVENTS.INQUIRY_SUBMIT, { school_level: data.schoolLevel });
      } else {
        const errData = await response.json().catch(() => ({}));
        const message =
          typeof errData.error === "string" && errData.error.trim()
            ? errData.error
            : "문의 등록에 실패했습니다. 다시 시도해주세요.";
        setSubmitError(message);
        toast.error(message);
      }
    } catch {
      const message = "문의 등록에 실패했습니다. 다시 시도해주세요.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 오류 문구가 붙지 않는 항목에서 검증이 막혀도 "눌러도 반응 없음"이 되지 않도록 항상 알린다.
  const onInvalid = () => {
    toast.error("입력 내용을 다시 확인해주세요.");
    document.querySelector("form .text-red-500.text-sm")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-brand-green-primary" />
            </div>
            <h1 className="text-3xl font-medium mb-4">문의가 접수되었습니다</h1>
            <p className="text-gray-600 mb-8">빠른 시일 내에 연락드리겠습니다.</p>
            {submitResult?.inquiryNumber && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm">
                <p className="font-medium text-text-dark">
                  접수번호: {submitResult.inquiryNumber}
                </p>
                <p className="mt-1 text-gray-600">
                  {submitResult.expectedReply || "영업일 기준 24시간 내 1차 회신 예정"}
                </p>
                <a
                  href={`/inquiry/status?number=${encodeURIComponent(submitResult.inquiryNumber)}`}
                  className="mt-2 inline-block font-medium text-brand-green-primary underline"
                >
                  진행 상황 조회하기
                </a>
              </div>
            )}
            <Button
              onClick={() => {
                setIsSuccess(false);
                setSubmitResult(null);
              }}
              className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white"
            >
              새 문의하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* 임시저장 복구 배너 */}
        {pendingDraft && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <History className="mt-0.5 w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-dark">
                작성 중이던 문의 내용이 있습니다
              </p>
              <p className="mt-0.5 text-xs text-text-gray">이어서 작성하시겠어요?</p>
              <div className="mt-2.5 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applyDraft(pendingDraft)}
                  className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white h-8 px-3 text-xs"
                >
                  이어서 작성하기
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={dismissDraft}
                  className="h-8 px-3 text-xs"
                >
                  새로 작성
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissDraft}
              aria-label="닫기"
              className="text-text-gray hover:text-text-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 참고 프로그램 배너 */}
        {presets?.programRef && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-green-primary/25 bg-brand-green-primary/10 px-4 py-3.5">
            <Bookmark className="mt-0.5 w-4 h-4 text-brand-green-primary flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-green-primary">
                참고 프로그램
              </p>
              <p className="mt-0.5 text-sm font-medium text-text-dark leading-snug">
                {presets.programRef}
              </p>
            </div>
          </div>
        )}

        {/* 모드 탭 */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-6">문의하기</h1>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === "quick"
                  ? "bg-brand-green-primary text-white"
                  : "bg-white text-text-gray hover:bg-gray-50"
              }`}
            >
              빠른 문의
              <span className={`block text-xs font-normal mt-0.5 ${mode === "quick" ? "text-white/80" : "text-text-gray/70"}`}>
                이름·연락처만으로 간단하게
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("detailed")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-l border-gray-200 ${
                mode === "detailed"
                  ? "bg-brand-green-primary text-white"
                  : "bg-white text-text-gray hover:bg-gray-50"
              }`}
            >
              상세 문의
              <span className={`block text-xs font-normal mt-0.5 ${mode === "detailed" ? "text-white/80" : "text-text-gray/70"}`}>
                6개 항목 · 견적 정확도 향상
              </span>
            </button>
          </div>
        </div>

        {submitError && (
          <ErrorMessage
            className="mb-6"
            message={submitError}
            onDismiss={() => setSubmitError(null)}
          />
        )}

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-10">
            <BasicInfoSection mode={mode} />

            {mode === "detailed" && (
              <>
                <ScheduleSection />
                <TravelSection />
                <LodgingSection />
                <ProgramSection />
                <SafetySection />
              </>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-brand-green-primary hover:bg-brand-green-primary/90 text-white"
            >
              {isSubmitting ? "제출 중..." : "문의하기"}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

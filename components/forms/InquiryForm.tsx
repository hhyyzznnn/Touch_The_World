"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useToast } from "@/components/ui/toast";
import { inquirySchema, type InquiryFormData } from "@/lib/inquiry-schema";
import { CheckCircle2, Bookmark } from "lucide-react";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

type SchoolSuggestion = { name: string; level: string; region: string | null };

function useSchoolAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}`);
        const data: SchoolSuggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  }, []);

  return { query, suggestions, open, setOpen, search };
}

type InquiryMode = "quick" | "detailed";

interface InquiryPresets {
  programRef?: string;
  destination?: string;
  schoolLevel?: string;
  purpose?: string;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhoneNumber(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatCurrency(value: string) {
  const digits = onlyDigits(value);
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

const inputClass =
  "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary";
const selectClass =
  "w-full px-4 py-3 h-11 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary";
const sectionClass = "space-y-5";
const sectionHeaderClass =
  "text-base font-semibold text-brand-green-primary border-b border-brand-green-primary/20 pb-2 mb-1";

function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className={sectionHeaderClass}>
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-green-primary text-white text-xs font-bold mr-2">
        {num}
      </span>
      {title}
    </div>
  );
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

  const autocomplete = useSchoolAutocomplete();
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const [dropdownAbove, setDropdownAbove] = useState(false);

  const handleSchoolFocus = () => {
    if (autocomplete.suggestions.length > 0) {
      const rect = schoolInputRef.current?.getBoundingClientRect();
      if (rect) setDropdownAbove(window.innerHeight - rect.bottom < 260);
      autocomplete.setOpen(true);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InquiryFormData>({
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

          {/* ── 카테고리 1: 기본 정보 ── */}
          <div className={sectionClass}>
            <SectionHeader num={1} title="기본 정보" />

            {/* 학교명 */}
            <div className="relative">
              <label htmlFor="schoolName" className="block text-sm font-medium mb-2">
                학교명 <span className="text-red-500">*</span>
              </label>
              <input
                id="schoolName"
                {...(() => {
                  const { ref, ...rest } = register("schoolName");
                  return {
                    ...rest,
                    ref: (el: HTMLInputElement | null) => {
                      ref(el);
                      (schoolInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    },
                  };
                })()}
                className={inputClass}
                placeholder="예: 서울중학교"
                autoComplete="off"
                onChange={(e) => {
                  register("schoolName").onChange(e);
                  autocomplete.search(e.target.value);
                }}
                onBlur={() => setTimeout(() => autocomplete.setOpen(false), 150)}
                onFocus={handleSchoolFocus}
              />
              {autocomplete.open && (
                <ul className={`absolute z-50 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto ${dropdownAbove ? "bottom-full mb-1" : "mt-1"}`}>
                  {autocomplete.suggestions.map((s) => (
                    <li
                      key={`${s.name}-${s.level}`}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onMouseDown={() => {
                        setValue("schoolName", s.name, { shouldValidate: true });
                        if (s.level) setValue("schoolLevel", s.level, { shouldValidate: true });
                        if (s.region) setValue("destination", s.region, { shouldValidate: true });
                        autocomplete.setOpen(false);
                      }}
                    >
                      <span className="text-sm font-medium text-text-dark">{s.name}</span>
                      <span className="ml-2 text-xs text-text-gray">{s.level}{s.region ? ` · ${s.region}` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
              {errors.schoolName && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolName.message}</p>
              )}
            </div>

            {/* 담당자명 + 직책 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact" className="block text-sm font-medium mb-2">
                  담당자명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact"
                  {...register("contact")}
                  className={inputClass}
                  placeholder="예: 홍길동"
                />
                {errors.contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium mb-2">
                  직책
                </label>
                <input
                  id="position"
                  {...register("position")}
                  className={inputClass}
                  placeholder="예: 교무부장, 담임교사"
                />
              </div>
            </div>

            {/* 연락처 + 이메일 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  {...register("phone", {
                    onChange: (event) => {
                      setValue("phone", formatPhoneNumber(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    },
                  })}
                  className={inputClass}
                  placeholder="예: 010-1234-5678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={inputClass}
                  placeholder="example@school.kr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* 학교 주소 */}
            {mode === "detailed" && (
              <div>
                <label htmlFor="schoolAddress" className="block text-sm font-medium mb-2">
                  학교 주소
                </label>
                <input
                  id="schoolAddress"
                  {...register("schoolAddress")}
                  className={inputClass}
                  placeholder="예: 서울특별시 강남구 학교로 123"
                />
              </div>
            )}

            {/* 빠른 문의: 메시지 바로 노출 */}
            {mode === "quick" && (
              <>
                <div>
                  <label htmlFor="destination-quick" className="block text-sm font-medium mb-2">
                    여행 지역
                  </label>
                  <select id="destination-quick" {...register("destination")} className={selectClass}>
                    <option value="">선택해주세요</option>
                    <optgroup label="국내">
                      {["서울/경기", "인천", "강원", "충청", "전라", "경상", "제주"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </optgroup>
                    <optgroup label="해외">
                      {["일본", "동남아시아", "기타 해외"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label htmlFor="message-quick" className="block text-sm font-medium mb-2">
                    문의 내용
                  </label>
                  <textarea
                    id="message-quick"
                    {...register("message")}
                    rows={5}
                    className={inputClass}
                    placeholder="궁금한 점이나 원하는 프로그램을 간단히 적어주세요"
                  />
                </div>
              </>
            )}
          </div>

          {/* ── 구체적인 문의 전용 섹션 ── */}
          {mode === "detailed" && (
            <>
              {/* ── 카테고리 2: 일정 및 인원 ── */}
              <div className={sectionClass}>
                <SectionHeader num={2} title="일정 및 인원" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="departureDate" className="block text-sm font-medium mb-2">
                      출발일
                    </label>
                    <input
                      id="departureDate"
                      {...register("departureDate")}
                      className={inputClass}
                      placeholder="예: 2025년 5월 12일"
                    />
                  </div>
                  <div>
                    <label htmlFor="returnDate" className="block text-sm font-medium mb-2">
                      도착일
                    </label>
                    <input
                      id="returnDate"
                      {...register("returnDate")}
                      className={inputClass}
                      placeholder="예: 2025년 5월 14일"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="participantCount" className="block text-sm font-medium mb-2">
                      학생 수 (명)
                    </label>
                    <input
                      id="participantCount"
                      type="text"
                      inputMode="numeric"
                      {...register("participantCount")}
                      className={inputClass}
                      placeholder="예: 120"
                    />
                  </div>
                  <div>
                    <label htmlFor="instructorCount" className="block text-sm font-medium mb-2">
                      인솔 교사 수 (명)
                    </label>
                    <input
                      id="instructorCount"
                      type="text"
                      inputMode="numeric"
                      {...register("instructorCount")}
                      className={inputClass}
                      placeholder="예: 6"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="schoolLevel" className="block text-sm font-medium mb-2">
                      학교급
                    </label>
                    <select id="schoolLevel" {...register("schoolLevel")} className={selectClass}>
                      <option value="">선택해주세요</option>
                      {["초등학교", "중학교", "고등학교", "특성화고", "대학교/기관"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="targetGrade" className="block text-sm font-medium mb-2">
                      대상 학년
                    </label>
                    <input
                      id="targetGrade"
                      {...register("targetGrade")}
                      className={inputClass}
                      placeholder="예: 2학년 전체, 1~3학년"
                    />
                  </div>
                </div>
              </div>

              {/* ── 카테고리 3: 여행 형태 및 선호도 ── */}
              <div className={sectionClass}>
                <SectionHeader num={3} title="여행 형태 및 선호도" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accommodation" className="block text-sm font-medium mb-2">
                      숙박 여부
                    </label>
                    <select id="accommodation" {...register("accommodation")} className={selectClass}>
                      <option value="">선택해주세요</option>
                      {["비숙박 (당일)", "1박 2일", "2박 3일", "3박 4일 이상"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="destination" className="block text-sm font-medium mb-2">
                      여행 지역
                    </label>
                    <select id="destination" {...register("destination")} className={selectClass}>
                      <option value="">선택해주세요</option>
                      <optgroup label="국내">
                        {["서울/경기", "인천", "강원", "충청", "전라", "경상", "제주"].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </optgroup>
                      <optgroup label="해외">
                        {["일본", "동남아시아", "기타 해외"].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium mb-2">
                    여행 목적/성격
                  </label>
                  <input
                    id="purpose"
                    {...register("purpose")}
                    className={inputClass}
                    placeholder="예: 역사 탐방, 과학 체험, 진로 탐색, 팀빌딩"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">주 이동수단</label>
                    <div className="grid grid-cols-2 gap-y-2">
                      {["전세버스", "KTX", "항공", "기타"].map((t) => (
                        <label key={t} className="flex items-center gap-2 py-0.5">
                          <input
                            type="radio"
                            value={t}
                            {...register("preferredTransport")}
                            className="accent-brand-green-primary"
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">인솔자 필요 여부</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="true"
                          {...register("hasInstructor")}
                          className="accent-brand-green-primary"
                        />
                        필요
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="false"
                          {...register("hasInstructor")}
                          className="accent-brand-green-primary"
                        />
                        불필요
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="localTransport" className="block text-sm font-medium mb-2">
                    현지 교통 수단
                  </label>
                  <input
                    id="localTransport"
                    {...register("localTransport")}
                    className={inputClass}
                    placeholder="예: 관광버스 포함, 도보 위주, 대중교통 활용"
                  />
                </div>
              </div>

              {/* ── 카테고리 4: 숙박 및 식사 ── */}
              <div className={sectionClass}>
                <SectionHeader num={4} title="숙박 및 식사" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accommodationType" className="block text-sm font-medium mb-2">
                      숙박 형태
                    </label>
                    <select id="accommodationType" {...register("accommodationType")} className={selectClass}>
                      <option value="">선택해주세요</option>
                      {["콘도/리조트", "호텔", "펜션", "청소년수련원", "학교 기숙사", "게스트하우스", "기타"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="roomAssignment" className="block text-sm font-medium mb-2">
                      객실 배정 방식
                    </label>
                    <input
                      id="roomAssignment"
                      {...register("roomAssignment")}
                      className={inputClass}
                      placeholder="예: 남녀 분리, 4인 1실, 담임 배정 필요"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mealPreference" className="block text-sm font-medium mb-2">
                      식사 취향
                    </label>
                    <input
                      id="mealPreference"
                      {...register("mealPreference")}
                      className={inputClass}
                      placeholder="예: 뷔페 선호, 한식 위주, 지역 향토 음식"
                    />
                  </div>
                  <div>
                    <label htmlFor="specialDiet" className="block text-sm font-medium mb-2">
                      특이 식단 (알러지 등)
                    </label>
                    <input
                      id="specialDiet"
                      {...register("specialDiet")}
                      className={inputClass}
                      placeholder="예: 견과류 알러지 2명, 채식주의 1명"
                    />
                  </div>
                </div>
              </div>

              {/* ── 카테고리 5: 교육 및 프로그램 ── */}
              <div className={sectionClass}>
                <SectionHeader num={5} title="교육 및 프로그램" />

                <div>
                  <label htmlFor="requiredSites" className="block text-sm font-medium mb-2">
                    필수 방문지
                  </label>
                  <input
                    id="requiredSites"
                    {...register("requiredSites")}
                    className={inputClass}
                    placeholder="예: 독립기념관, 국립공원, 특정 기업 견학"
                  />
                </div>

                <div>
                  <label htmlFor="experiencePrograms" className="block text-sm font-medium mb-2">
                    희망 체험 프로그램
                  </label>
                  <textarea
                    id="experiencePrograms"
                    {...register("experiencePrograms")}
                    rows={2}
                    className={inputClass}
                    placeholder="예: 도자기 만들기, 래프팅, 농촌 체험, 사찰 템플스테이"
                  />
                </div>

                <div>
                  <label htmlFor="ownEvents" className="block text-sm font-medium mb-2">
                    자체 행사 여부/내용
                  </label>
                  <input
                    id="ownEvents"
                    {...register("ownEvents")}
                    className={inputClass}
                    placeholder="예: 레크레이션 자체 진행, 시상식 포함, 장기자랑 준비"
                  />
                </div>

                <div>
                  <label htmlFor="facilityRequirements" className="block text-sm font-medium mb-2">
                    시설 요구사항
                  </label>
                  <input
                    id="facilityRequirements"
                    {...register("facilityRequirements")}
                    className={inputClass}
                    placeholder="예: 강당/회의실 필요, 체육시설 포함, 수영장 원함"
                  />
                </div>

                <div>
                  <label htmlFor="agentService" className="block text-sm font-medium mb-2">
                    섭외 대행 필요 항목
                  </label>
                  <input
                    id="agentService"
                    {...register("agentService")}
                    className={inputClass}
                    placeholder="예: 강연자 섭외, 사진작가 동행, 공연단 섭외"
                  />
                </div>
              </div>

              {/* ── 카테고리 6: 안전·행정 및 기타 ── */}
              <div className={sectionClass}>
                <SectionHeader num={6} title="안전·행정 및 기타" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="insurance" className="block text-sm font-medium mb-2">
                      보험 요구사항
                    </label>
                    <select id="insurance" {...register("insurance")} className={selectClass}>
                      <option value="">선택해주세요</option>
                      {["여행자보험 포함 요청", "학교 단체보험 별도 가입", "여행사 기본보험만", "미정"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">안전 요원 필요 여부</label>
                    <div className="flex gap-6 mt-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="true"
                          {...register("safetyStaff")}
                          className="accent-brand-green-primary"
                        />
                        필요
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="false"
                          {...register("safetyStaff")}
                          className="accent-brand-green-primary"
                        />
                        불필요
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium mb-2">
                    특별 지원 필요 학생
                  </label>
                  <textarea
                    id="specialRequests"
                    {...register("specialRequests")}
                    rows={2}
                    className={inputClass}
                    placeholder="예: 휠체어 이용 1명, 당뇨 관리 2명, 의료진 동행 필요"
                  />
                </div>

                <div>
                  <label htmlFor="rainPlan" className="block text-sm font-medium mb-2">
                    우천 대비 계획
                  </label>
                  <input
                    id="rainPlan"
                    {...register("rainPlan")}
                    className={inputClass}
                    placeholder="예: 실내 대체 프로그램 준비 원함, 우천 시 일정 변경 유연하게"
                  />
                </div>

                <div>
                  <label htmlFor="estimatedBudget" className="block text-sm font-medium mb-2">
                    예상 예산 (원)
                  </label>
                  <input
                    id="estimatedBudget"
                    type="text"
                    inputMode="numeric"
                    {...register("estimatedBudget", {
                      setValueAs: (value) =>
                        typeof value === "string" && value
                          ? parseInt(onlyDigits(value), 10)
                          : undefined,
                      onChange: (event) => {
                        setValue(
                          "estimatedBudget",
                          formatCurrency(event.target.value) as unknown as number,
                          { shouldDirty: true, shouldValidate: true }
                        );
                      },
                    })}
                    className={inputClass}
                    placeholder="예: 5,000,000"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    기타 문의 내용
                  </label>
                  <textarea
                    id="message"
                    {...register("message")}
                    rows={4}
                    className={inputClass}
                    placeholder="추가로 전달하고 싶은 내용을 자유롭게 입력해주세요"
                  />
                </div>
              </div>
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
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useToast } from "@/components/ui/toast";
import { inquirySchema, type InquiryFormData } from "@/lib/inquiry-schema";

type InquiryMode = "quick" | "detailed";

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

export function InquiryForm({ initialMode }: { initialMode: InquiryMode }) {
  const toast = useToast();
  const [mode, setMode] = useState<InquiryMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    inquiryNumber?: string;
    expectedReply?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
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
      } else {
        const data = await response.json().catch(() => ({}));
        const message =
          typeof data.error === "string" && data.error.trim()
            ? data.error
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
            <div className="text-6xl mb-4">✓</div>
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
              <span
                className={`block text-xs font-normal mt-0.5 ${
                  mode === "quick" ? "text-white/80" : "text-text-gray/70"
                }`}
              >
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
              구체적인 문의
              <span
                className={`block text-xs font-normal mt-0.5 ${
                  mode === "detailed" ? "text-white/80" : "text-text-gray/70"
                }`}
              >
                일정·인원·예산까지 상세 입력
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 기본 정보 — 두 모드 공통 */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-text-dark border-b border-gray-200 pb-2">
              기본 정보
            </h2>

            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium mb-2">
                학교명 <span className="text-red-500">*</span>
              </label>
              <input
                id="schoolName"
                {...register("schoolName")}
                className={inputClass}
                placeholder="예: 서울초등학교"
              />
              {errors.schoolName && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolName.message}</p>
              )}
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  연락처
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
                  {...register("email")}
                  className={inputClass}
                  placeholder="example@school.kr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* 빠른 문의: 메시지 바로 표시 */}
            {mode === "quick" && (
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
            )}
          </div>

          {/* 구체적인 문의 전용 필드 */}
          {mode === "detailed" && (
            <>
              <div className="space-y-6">
                <h2 className="text-xl font-medium text-text-dark border-b border-gray-200 pb-2">
                  프로그램 정보
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expectedDate" className="block text-sm font-medium mb-2">
                      예상 일정
                    </label>
                    <input
                      id="expectedDate"
                      type="text"
                      {...register("expectedDate")}
                      className={inputClass}
                      placeholder="예: 2025년 3월 중순"
                    />
                  </div>

                  <div>
                    <label htmlFor="participantCount" className="block text-sm font-medium mb-2">
                      예상 인원 (명)
                    </label>
                    <input
                      id="participantCount"
                      type="number"
                      min="1"
                      {...register("participantCount")}
                      className={inputClass}
                      placeholder="예: 50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium mb-2">
                    여행 목적/성격
                  </label>
                  <input
                    id="purpose"
                    type="text"
                    {...register("purpose")}
                    className={inputClass}
                    placeholder="예: 역사 탐방, 문화 체험, 자연 학습 등"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">인솔자 필요 여부</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="true"
                          {...register("hasInstructor")}
                          className="mr-2 accent-brand-green-primary"
                        />
                        필요
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="false"
                          {...register("hasInstructor")}
                          className="mr-2 accent-brand-green-primary"
                        />
                        불필요
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">선호 이동수단</label>
                    <div className="flex flex-wrap gap-4">
                      {["전세버스", "KTX", "항공", "기타"].map((t) => (
                        <label key={t} className="flex items-center">
                          <input
                            type="radio"
                            value={t}
                            {...register("preferredTransport")}
                            className="mr-2 accent-brand-green-primary"
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="mealPreference" className="block text-sm font-medium mb-2">
                    식사 취향/요구사항
                  </label>
                  <input
                    id="mealPreference"
                    type="text"
                    {...register("mealPreference")}
                    className={inputClass}
                    placeholder="예: 채식, 알러지 등"
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
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-medium text-text-dark border-b border-gray-200 pb-2">
                  추가 정보
                </h2>

                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium mb-2">
                    특별 요구사항
                  </label>
                  <textarea
                    id="specialRequests"
                    {...register("specialRequests")}
                    rows={3}
                    className={inputClass}
                    placeholder="예: 알러지, 장애 학생 지원, 특정 견학지 포함 등"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    기타 문의 내용
                  </label>
                  <textarea
                    id="message"
                    {...register("message")}
                    rows={6}
                    className={inputClass}
                    placeholder="추가로 전달하고 싶은 내용을 입력해주세요"
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

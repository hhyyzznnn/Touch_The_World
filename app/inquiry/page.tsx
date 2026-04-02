"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useToast } from "@/components/ui/toast";
import { inquirySchema, type InquiryFormData } from "@/lib/inquiry-schema";

export default function InquiryPage() {
  const toast = useToast();
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
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
            <p className="text-gray-600 mb-8">
              빠른 시일 내에 연락드리겠습니다.
            </p>
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
        <h1 className="text-3xl font-medium mb-8">문의하기</h1>
        {submitError && (
          <ErrorMessage
            className="mb-6"
            message={submitError}
            onDismiss={() => setSubmitError(null)}
          />
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 기본 정보 */}
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
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="예: 서울초등학교"
              />
              {errors.schoolName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.schoolName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium mb-2">
                담당자명 <span className="text-red-500">*</span>
              </label>
              <input
                id="contact"
                {...register("contact")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="예: 홍길동"
              />
              {errors.contact && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  연락처
                </label>
                <input
                  id="phone"
                  {...register("phone")}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                  placeholder="예: 010-1234-5678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                  placeholder="example@school.kr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 프로그램 정보 */}
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
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
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="예: 역사 탐방, 문화 체험, 자연 학습 등"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  인솔자 필요 여부
                </label>
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
                <label className="block text-sm font-medium mb-2">
                  선호 이동수단
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="전세버스"
                      {...register("preferredTransport")}
                      className="mr-2 accent-brand-green-primary"
                    />
                    전세버스
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="KTX"
                      {...register("preferredTransport")}
                      className="mr-2 accent-brand-green-primary"
                    />
                    KTX
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="항공"
                      {...register("preferredTransport")}
                      className="mr-2 accent-brand-green-primary"
                    />
                    항공
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="기타"
                      {...register("preferredTransport")}
                      className="mr-2 accent-brand-green-primary"
                    />
                    기타
                  </label>
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
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="예: 채식, 알러지 등"
              />
            </div>

            <div>
              <label htmlFor="estimatedBudget" className="block text-sm font-medium mb-2">
                예상 예산 (원)
              </label>
              <input
                id="estimatedBudget"
                type="number"
                min="0"
                {...register("estimatedBudget")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="예: 5,000,000"
              />
            </div>
          </div>

          {/* 추가 정보 */}
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
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
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
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="추가로 전달하고 싶은 내용을 입력해주세요"
              />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-brand-green-primary hover:bg-brand-green-primary/90 text-white">
            {isSubmitting ? "제출 중..." : "문의하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}

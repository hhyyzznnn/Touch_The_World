"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";

const inquirySchema = z.object({
  schoolName: z.string().min(1, "학교명을 입력해주세요"),
  contact: z.string().min(1, "담당자명을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  message: z.string().optional(),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

export default function InquiryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
        reset();
      } else {
        alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
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
            <Button
              onClick={() => {
                setIsSuccess(false);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              연락처 <span className="text-red-500">*</span>
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
              이메일 <span className="text-red-500">*</span>
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

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              문의 내용
            </label>
            <textarea
              id="message"
              {...register("message")}
              rows={6}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
              placeholder="희망 일정, 학생 수, 특이사항 등을 입력해주세요"
            />
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-brand-green-primary hover:bg-brand-green-primary/90 text-white">
            {isSubmitting ? "제출 중..." : "문의하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}


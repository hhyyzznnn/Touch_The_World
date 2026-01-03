import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { validateAndSanitize, isValidEmail, isValidPhone } from "@/lib/security";
import { sendInquiryNotificationEmail } from "@/lib/email";

const inquirySchema = z.object({
  schoolName: z.string().min(1).max(100),
  contact: z.string().min(1).max(50),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(100),
  expectedDate: z.string().max(100).optional(),
  participantCount: z.number().int().positive().optional(),
  purpose: z.string().max(200).optional(),
  hasInstructor: z.boolean().optional(),
  preferredTransport: z.string().max(50).optional(),
  mealPreference: z.string().max(200).optional(),
  specialRequests: z.string().max(1000).optional(),
  estimatedBudget: z.number().int().nonnegative().optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  // Rate Limiting: IP당 1분에 3회 제한
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`inquiry:${clientIP}`, 3, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    
    // 입력 검증 및 정리
    const schoolNameValidation = validateAndSanitize(body.schoolName || "", {
      maxLength: 100,
      minLength: 1,
      required: true,
    });
    if (!schoolNameValidation.valid) {
      return NextResponse.json(
        { error: `학교명: ${'error' in schoolNameValidation ? schoolNameValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    const contactValidation = validateAndSanitize(body.contact || "", {
      maxLength: 50,
      minLength: 1,
      required: true,
    });
    if (!contactValidation.valid) {
      return NextResponse.json(
        { error: `담당자명: ${'error' in contactValidation ? contactValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email || "")) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    if (!isValidPhone(body.phone || "")) {
      return NextResponse.json(
        { error: "올바른 전화번호 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 선택적 필드 검증
    const expectedDateValidation = body.expectedDate
      ? validateAndSanitize(body.expectedDate, {
          maxLength: 100,
          allowHtml: false,
        })
      : { valid: true, sanitized: null };
    if (!expectedDateValidation.valid) {
      return NextResponse.json(
        { error: `예상 일정: ${'error' in expectedDateValidation ? expectedDateValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    const purposeValidation = body.purpose
      ? validateAndSanitize(body.purpose, {
          maxLength: 200,
          allowHtml: false,
        })
      : { valid: true, sanitized: null };
    if (!purposeValidation.valid) {
      return NextResponse.json(
        { error: `여행 목적: ${'error' in purposeValidation ? purposeValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    const preferredTransportValidation = body.preferredTransport
      ? validateAndSanitize(body.preferredTransport, {
          maxLength: 50,
          allowHtml: false,
        })
      : { valid: true, sanitized: null };
    if (!preferredTransportValidation.valid) {
      return NextResponse.json(
        { error: `선호 이동수단: ${'error' in preferredTransportValidation ? preferredTransportValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    const mealPreferenceValidation = body.mealPreference
      ? validateAndSanitize(body.mealPreference, {
          maxLength: 200,
          allowHtml: false,
        })
      : { valid: true, sanitized: null };
    if (!mealPreferenceValidation.valid) {
      return NextResponse.json(
        { error: `식사 취향: ${'error' in mealPreferenceValidation ? mealPreferenceValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    const specialRequestsValidation = body.specialRequests
      ? validateAndSanitize(body.specialRequests, {
          maxLength: 1000,
          allowHtml: false,
        })
      : { valid: true, sanitized: null };
    if (!specialRequestsValidation.valid) {
      return NextResponse.json(
        { error: `특별 요구사항: ${'error' in specialRequestsValidation ? specialRequestsValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    const messageValidation = body.message
      ? validateAndSanitize(body.message, {
          maxLength: 2000,
          allowHtml: false,
        })
      : { valid: true, sanitized: null };
    if (!messageValidation.valid) {
      return NextResponse.json(
        { error: `문의 내용: ${'error' in messageValidation ? messageValidation.error : "유효하지 않은 입력입니다."}` },
        { status: 400 }
      );
    }

    // Zod 스키마 검증
    const data = inquirySchema.parse({
      schoolName: schoolNameValidation.sanitized,
      contact: contactValidation.sanitized,
      phone: body.phone,
      email: body.email,
      expectedDate: expectedDateValidation.sanitized || undefined,
      participantCount: body.participantCount ? parseInt(body.participantCount) : undefined,
      purpose: purposeValidation.sanitized || undefined,
      hasInstructor: body.hasInstructor === "true" ? true : body.hasInstructor === "false" ? false : body.hasInstructor,
      preferredTransport: preferredTransportValidation.sanitized || undefined,
      mealPreference: mealPreferenceValidation.sanitized || undefined,
      specialRequests: specialRequestsValidation.sanitized || undefined,
      estimatedBudget: body.estimatedBudget ? parseInt(body.estimatedBudget) : undefined,
      message: messageValidation.sanitized || undefined,
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        schoolName: data.schoolName,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        expectedDate: data.expectedDate || null,
        participantCount: data.participantCount || null,
        purpose: data.purpose || null,
        hasInstructor: data.hasInstructor ?? null,
        preferredTransport: data.preferredTransport || null,
        mealPreference: data.mealPreference || null,
        specialRequests: data.specialRequests || null,
        estimatedBudget: data.estimatedBudget || null,
        message: data.message || null,
      },
    });

    // 이메일 알림 전송 (비동기로 실행, 실패해도 문의 등록은 성공 처리)
    sendInquiryNotificationEmail({
      schoolName: data.schoolName,
      contact: data.contact,
      phone: data.phone,
      email: data.email,
      message: data.message || null,
      expectedDate: data.expectedDate || null,
      participantCount: data.participantCount || null,
      purpose: data.purpose || null,
      hasInstructor: data.hasInstructor ?? null,
      preferredTransport: data.preferredTransport || null,
      mealPreference: data.mealPreference || null,
      specialRequests: data.specialRequests || null,
      estimatedBudget: data.estimatedBudget || null,
    }).catch((error) => {
      console.error("이메일 알림 전송 실패:", error);
      // 이메일 전송 실패는 로그만 남기고 사용자에게는 에러를 반환하지 않음
    });

    return NextResponse.json(
      { success: true, id: inquiry.id },
      {
        headers: {
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력 데이터가 올바르지 않습니다.", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Inquiry creation error:", error);
    return NextResponse.json(
      { error: "문의 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}

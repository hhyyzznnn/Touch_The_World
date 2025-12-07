import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { validateAndSanitize, isValidEmail, isValidPhone } from "@/lib/security";

const inquirySchema = z.object({
  schoolName: z.string().min(1).max(100),
  contact: z.string().min(1).max(50),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(100),
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
        { error: `학교명: ${schoolNameValidation.error}` },
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
        { error: `담당자명: ${contactValidation.error}` },
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

    const messageValidation = body.message
      ? validateAndSanitize(body.message, {
          maxLength: 2000,
          allowHtml: false,
        })
      : { valid: true, sanitized: "" };
    if (!messageValidation.valid) {
      return NextResponse.json(
        { error: `문의 내용: ${messageValidation.error}` },
        { status: 400 }
      );
    }

    // Zod 스키마 검증
    const data = inquirySchema.parse({
      schoolName: schoolNameValidation.sanitized,
      contact: contactValidation.sanitized,
      phone: body.phone,
      email: body.email,
      message: messageValidation.sanitized || undefined,
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        schoolName: data.schoolName,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        message: data.message || null,
      },
    });

    // TODO: 이메일 알림 기능 추가

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


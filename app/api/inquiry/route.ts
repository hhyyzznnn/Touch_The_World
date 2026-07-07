import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { validateAndSanitize, isValidEmail, isValidPhone } from "@/lib/security";
import { sendInquiryNotificationEmail } from "@/lib/email";
import { generateInquirySummary } from "@/lib/inquiry-ai";
import { getCurrentUser } from "@/lib/auth-user";
import { formatInquiryNumber } from "@/lib/inquiry-status";

const inquirySchema = z.object({
  // 카테고리 1: 기본 정보
  schoolName: z.string().min(1).max(100),
  contact: z.string().min(1).max(50),
  position: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  schoolAddress: z.string().max(200).optional(),

  // 카테고리 2: 일정 및 인원
  departureDate: z.string().max(100).optional(),
  returnDate: z.string().max(100).optional(),
  participantCount: z.number().int().positive().optional(),
  instructorCount: z.number().int().positive().optional(),
  targetGrade: z.string().max(100).optional(),

  // 카테고리 3: 여행 형태 및 선호도
  destination: z.string().max(50).optional(),
  purpose: z.string().max(200).optional(),
  preferredTransport: z.string().max(50).optional(),
  hasInstructor: z.boolean().optional(),
  localTransport: z.string().max(100).optional(),

  // 카테고리 4: 숙박 및 식사
  accommodation: z.string().max(50).optional(),
  accommodationType: z.string().max(100).optional(),
  roomAssignment: z.string().max(200).optional(),
  mealPreference: z.string().max(200).optional(),
  specialDiet: z.string().max(200).optional(),

  // 카테고리 5: 교육 및 프로그램
  requiredSites: z.string().max(500).optional(),
  experiencePrograms: z.string().max(500).optional(),
  ownEvents: z.string().max(500).optional(),
  facilityRequirements: z.string().max(500).optional(),
  agentService: z.string().max(500).optional(),

  // 카테고리 6: 안전·행정 및 기타
  insurance: z.string().max(200).optional(),
  safetyStaff: z.boolean().optional(),
  specialRequests: z.string().max(1000).optional(),
  rainPlan: z.string().max(500).optional(),
  message: z.string().max(2000).optional(),

  // 예산 및 학교급
  estimatedBudget: z.number().int().nonnegative().optional(),
  schoolLevel: z.string().max(50).optional(),
  expectedDate: z.string().max(100).optional(),
}).superRefine((value, ctx) => {
  if (!value.phone && !value.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "연락처를 입력해주세요.",
    });
  }
});

function sanitizeOpt(value: unknown, maxLength: number) {
  if (!value || typeof value !== "string") return { valid: true as const, sanitized: null };
  return validateAndSanitize(value, { maxLength, allowHtml: false });
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimit = await checkRateLimit(`inquiry:${clientIP}`, 3, 60 * 1000);

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
    const currentUser = await getCurrentUser();
    const body = await request.json();

    // 필수 필드 검증
    const schoolNameV = validateAndSanitize(body.schoolName || "", { maxLength: 100, minLength: 1, required: true });
    if (!schoolNameV.valid) return NextResponse.json({ error: `학교명: ${schoolNameV.error}` }, { status: 400 });

    const contactV = validateAndSanitize(body.contact || "", { maxLength: 50, minLength: 1, required: true });
    if (!contactV.valid) return NextResponse.json({ error: `담당자명: ${contactV.error}` }, { status: 400 });

    const normalizedPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    const normalizedEmail = typeof body.email === "string" ? body.email.trim() : "";

    if (!normalizedPhone && !normalizedEmail) {
      return NextResponse.json({ error: "연락처를 입력해주세요." }, { status: 400 });
    }
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "올바른 이메일 형식이 아닙니다." }, { status: 400 });
    }
    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      return NextResponse.json({ error: "올바른 전화번호 형식이 아닙니다." }, { status: 400 });
    }

    // 선택 필드 검증 (공통 헬퍼 사용)
    const fields: Record<string, { result: ReturnType<typeof sanitizeOpt>; label: string }> = {
      position:             { result: sanitizeOpt(body.position, 50),             label: "직책" },
      schoolAddress:        { result: sanitizeOpt(body.schoolAddress, 200),        label: "학교 주소" },
      departureDate:        { result: sanitizeOpt(body.departureDate, 100),        label: "출발일" },
      returnDate:           { result: sanitizeOpt(body.returnDate, 100),           label: "도착일" },
      targetGrade:          { result: sanitizeOpt(body.targetGrade, 100),          label: "대상 학년" },
      purpose:              { result: sanitizeOpt(body.purpose, 200),              label: "여행 목적" },
      preferredTransport:   { result: sanitizeOpt(body.preferredTransport, 50),    label: "이동수단" },
      localTransport:       { result: sanitizeOpt(body.localTransport, 100),       label: "현지 교통" },
      accommodationType:    { result: sanitizeOpt(body.accommodationType, 100),    label: "숙박 형태" },
      roomAssignment:       { result: sanitizeOpt(body.roomAssignment, 200),       label: "객실 배정" },
      mealPreference:       { result: sanitizeOpt(body.mealPreference, 200),       label: "식사 취향" },
      specialDiet:          { result: sanitizeOpt(body.specialDiet, 200),          label: "특이 식단" },
      requiredSites:        { result: sanitizeOpt(body.requiredSites, 500),        label: "필수 방문지" },
      experiencePrograms:   { result: sanitizeOpt(body.experiencePrograms, 500),   label: "체험 프로그램" },
      ownEvents:            { result: sanitizeOpt(body.ownEvents, 500),            label: "자체 행사" },
      facilityRequirements: { result: sanitizeOpt(body.facilityRequirements, 500), label: "시설 요구사항" },
      agentService:         { result: sanitizeOpt(body.agentService, 500),         label: "섭외 대행" },
      insurance:            { result: sanitizeOpt(body.insurance, 200),            label: "보험" },
      specialRequests:      { result: sanitizeOpt(body.specialRequests, 1000),     label: "특별 지원" },
      rainPlan:             { result: sanitizeOpt(body.rainPlan, 500),             label: "우천 대비" },
      message:              { result: sanitizeOpt(body.message, 2000),             label: "문의 내용" },
      expectedDate:         { result: sanitizeOpt(body.expectedDate, 100),         label: "예상 일정" },
    };

    for (const [, { result, label }] of Object.entries(fields)) {
      if (!result.valid && "error" in result) {
        return NextResponse.json({ error: `${label}: ${result.error}` }, { status: 400 });
      }
    }

    const s = (key: string) => {
      const r = fields[key]?.result;
      return r && "sanitized" in r ? r.sanitized || undefined : undefined;
    };

    const data = inquirySchema.parse({
      schoolName: schoolNameV.sanitized || "",
      contact: contactV.sanitized || "",
      position: s("position"),
      phone: normalizedPhone || undefined,
      email: normalizedEmail || undefined,
      schoolAddress: s("schoolAddress"),
      departureDate: s("departureDate"),
      returnDate: s("returnDate"),
      participantCount: body.participantCount ? parseInt(body.participantCount) : undefined,
      instructorCount: body.instructorCount ? parseInt(body.instructorCount) : undefined,
      targetGrade: s("targetGrade"),
      destination: body.destination || undefined,
      purpose: s("purpose"),
      preferredTransport: s("preferredTransport"),
      hasInstructor: body.hasInstructor === "true" ? true : body.hasInstructor === "false" ? false : body.hasInstructor,
      localTransport: s("localTransport"),
      accommodation: body.accommodation || undefined,
      accommodationType: s("accommodationType"),
      roomAssignment: s("roomAssignment"),
      mealPreference: s("mealPreference"),
      specialDiet: s("specialDiet"),
      requiredSites: s("requiredSites"),
      experiencePrograms: s("experiencePrograms"),
      ownEvents: s("ownEvents"),
      facilityRequirements: s("facilityRequirements"),
      agentService: s("agentService"),
      insurance: s("insurance"),
      safetyStaff: body.safetyStaff === "true" ? true : body.safetyStaff === "false" ? false : body.safetyStaff,
      specialRequests: s("specialRequests"),
      rainPlan: s("rainPlan"),
      message: s("message"),
      estimatedBudget: body.estimatedBudget ? parseInt(String(body.estimatedBudget).replace(/,/g, "")) : undefined,
      schoolLevel: body.schoolLevel || undefined,
      expectedDate: s("expectedDate"),
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: currentUser?.id || null,
        schoolName: data.schoolName,
        contact: data.contact,
        position: data.position ?? null,
        phone: data.phone || "",
        email: data.email || "",
        schoolAddress: data.schoolAddress ?? null,
        departureDate: data.departureDate ?? null,
        returnDate: data.returnDate ?? null,
        participantCount: data.participantCount ?? null,
        instructorCount: data.instructorCount ?? null,
        targetGrade: data.targetGrade ?? null,
        destination: data.destination ?? null,
        purpose: data.purpose ?? null,
        preferredTransport: data.preferredTransport ?? null,
        hasInstructor: data.hasInstructor ?? null,
        localTransport: data.localTransport ?? null,
        accommodation: data.accommodation ?? null,
        accommodationType: data.accommodationType ?? null,
        roomAssignment: data.roomAssignment ?? null,
        mealPreference: data.mealPreference ?? null,
        specialDiet: data.specialDiet ?? null,
        requiredSites: data.requiredSites ?? null,
        experiencePrograms: data.experiencePrograms ?? null,
        ownEvents: data.ownEvents ?? null,
        facilityRequirements: data.facilityRequirements ?? null,
        agentService: data.agentService ?? null,
        insurance: data.insurance ?? null,
        safetyStaff: data.safetyStaff ?? null,
        specialRequests: data.specialRequests ?? null,
        rainPlan: data.rainPlan ?? null,
        message: data.message ?? null,
        estimatedBudget: data.estimatedBudget ?? null,
        schoolLevel: data.schoolLevel ?? null,
        expectedDate: data.expectedDate ?? data.departureDate ?? null,
      },
    });

    // AI 요약 (실패해도 문의는 성공)
    try {
      const aiSummary = await generateInquirySummary({
        schoolName: data.schoolName,
        destination: data.destination,
        schoolLevel: data.schoolLevel,
        participantCount: data.participantCount,
        expectedDate: data.departureDate ?? data.expectedDate,
        purpose: data.purpose,
        estimatedBudget: data.estimatedBudget,
        hasInstructor: data.hasInstructor,
        preferredTransport: data.preferredTransport,
        accommodation: data.accommodation,
        message: data.message,
        specialRequests: data.specialRequests,
      });
      if (aiSummary) {
        await prisma.inquiry.update({ where: { id: inquiry.id }, data: { aiSummary } });
      }
    } catch (error) {
      console.error("AI 요약 생성 실패:", error);
    }

    // 이메일 알림 (실패해도 문의는 성공)
    try {
      await sendInquiryNotificationEmail({
        schoolName: data.schoolName,
        contact: data.contact,
        position: data.position,
        phone: data.phone || null,
        email: data.email || null,
        schoolAddress: data.schoolAddress,
        departureDate: data.departureDate,
        returnDate: data.returnDate,
        participantCount: data.participantCount || null,
        instructorCount: data.instructorCount,
        targetGrade: data.targetGrade,
        destination: data.destination,
        purpose: data.purpose || null,
        preferredTransport: data.preferredTransport || null,
        hasInstructor: data.hasInstructor ?? null,
        localTransport: data.localTransport,
        accommodation: data.accommodation,
        accommodationType: data.accommodationType,
        roomAssignment: data.roomAssignment,
        mealPreference: data.mealPreference || null,
        specialDiet: data.specialDiet,
        requiredSites: data.requiredSites,
        experiencePrograms: data.experiencePrograms,
        ownEvents: data.ownEvents,
        facilityRequirements: data.facilityRequirements,
        agentService: data.agentService,
        insurance: data.insurance,
        safetyStaff: data.safetyStaff ?? null,
        specialRequests: data.specialRequests || null,
        rainPlan: data.rainPlan,
        message: data.message || null,
        estimatedBudget: data.estimatedBudget || null,
      });
    } catch (error) {
      console.error("이메일 알림 전송 실패:", error);
    }

    return NextResponse.json(
      {
        success: true,
        id: inquiry.id,
        inquiryNumber: formatInquiryNumber(inquiry.id),
        expectedReply: "영업일 기준 24시간 이내 1차 회신",
      },
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
    return NextResponse.json({ error: "문의 등록에 실패했습니다." }, { status: 500 });
  }
}

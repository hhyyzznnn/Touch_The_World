import { z } from "zod";

export const inquirySchema = z.object({
  // 카테고리 1: 기본 정보
  schoolName: z.string().min(1, "학교명을 입력해주세요"),
  contact: z.string().min(1, "담당자명을 입력해주세요"),
  position: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "올바른 이메일을 입력해주세요",
    }),
  schoolAddress: z.string().optional(),

  // 카테고리 2: 일정 및 인원
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  participantCount: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  instructorCount: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  targetGrade: z.string().optional(),

  // 카테고리 3: 여행 형태 및 선호도
  destination: z.string().optional(),
  purpose: z.string().optional(),
  // 라디오 버튼은 아무것도 고르지 않으면 값이 null로 들어온다. null을 막으면 화면에 오류 표시도
  // 없이 제출 자체가 안 되므로(상세 문의가 조용히 접수 실패하던 원인) 선택 안 함으로 받아준다.
  preferredTransport: z
    .string()
    .nullish()
    .transform((val) => val ?? undefined),
  hasInstructor: z
    .string()
    .nullish()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  localTransport: z.string().optional(),

  // 카테고리 4: 숙박 및 식사
  accommodation: z.string().optional(),
  accommodationType: z.string().optional(),
  roomAssignment: z.string().optional(),
  mealPreference: z.string().optional(),
  specialDiet: z.string().optional(),

  // 카테고리 5: 교육 및 프로그램
  requiredSites: z.string().optional(),
  experiencePrograms: z.string().optional(),
  ownEvents: z.string().optional(),
  facilityRequirements: z.string().optional(),
  agentService: z.string().optional(),

  // 카테고리 6: 안전·행정 및 기타
  insurance: z.string().optional(),
  safetyStaff: z
    .string()
    .nullish()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  specialRequests: z.string().optional(),
  rainPlan: z.string().optional(),
  message: z.string().optional(),

  // 예산 및 학교급
  estimatedBudget: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === "number") return val;
      if (typeof val === "string" && val) return parseInt(val.replace(/,/g, ""), 10);
      return undefined;
    }),
  schoolLevel: z.string().optional(),

  // 레거시 필드
  expectedDate: z.string().optional(),
}).superRefine((value, ctx) => {
  const hasPhone = typeof value.phone === "string" && value.phone.trim().length > 0;
  const hasEmail = typeof value.email === "string" && value.email.trim().length > 0;
  if (!hasPhone && !hasEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "연락처를 입력해주세요.",
      path: ["phone"],
    });
  }
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

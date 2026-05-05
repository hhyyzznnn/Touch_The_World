import { z } from "zod";

export const inquirySchema = z.object({
  schoolName: z.string().min(1, "학교명을 입력해주세요"),
  contact: z.string().min(1, "담당자명을 입력해주세요"),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "올바른 이메일을 입력해주세요",
    }),
  expectedDate: z.string().optional(),
  participantCount: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  purpose: z.string().optional(),
  hasInstructor: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  preferredTransport: z.string().optional(),
  mealPreference: z.string().optional(),
  specialRequests: z.string().optional(),
  estimatedBudget: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  destination: z.string().optional(),
  schoolLevel: z.string().optional(),
  accommodation: z.string().optional(),
  message: z.string().optional(),
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

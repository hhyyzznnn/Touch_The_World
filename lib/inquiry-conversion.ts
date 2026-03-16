import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const RECENT_DUPLICATE_WINDOW_HOURS = 6;
const INQUIRY_MAX_BUDGET = 2_147_483_647;
const INQUIRY_MESSAGE_MAX_LENGTH = 2000;

type ConversionReason =
  | "not_found"
  | "already_converted"
  | "insufficient_name"
  | "insufficient_contact"
  | "insufficient_context"
  | "duplicate_session"
  | "duplicate_recent_contact"
  | "create_failed";

export interface MaybeCreateInquiryResult {
  success: boolean;
  created: boolean;
  reason?: ConversionReason;
  inquiryId?: string;
  existingInquiryId?: string;
  signalCount?: number;
  error?: string;
}

function hasText(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizePhone(value?: string | null): string {
  if (!hasText(value)) return "";
  return value.trim();
}

function normalizeEmail(value?: string | null): string {
  if (!hasText(value)) return "";
  return value.trim().toLowerCase();
}

function countQualificationSignals(log: {
  participantCount: number | null;
  region: string | null;
  expectedDate: string | null;
  purpose: string | null;
}): number {
  let score = 0;
  if (typeof log.participantCount === "number" && log.participantCount > 0) score += 1;
  if (hasText(log.region)) score += 1;
  if (hasText(log.expectedDate)) score += 1;
  if (hasText(log.purpose)) score += 1;
  return score;
}

function toInquiryBudget(value: bigint | null): number | null {
  if (typeof value !== "bigint") return null;
  if (value > BigInt(INQUIRY_MAX_BUDGET)) return null;
  return Number(value);
}

function buildAiInquirySummary(log: {
  category: string | null;
  participantCount: number | null;
  region: string | null;
  expectedDate: string | null;
  purpose: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
}): string {
  const categoryText = hasText(log.category) ? log.category.trim() : "미선택";
  const participantText =
    typeof log.participantCount === "number" && log.participantCount > 0
      ? `${log.participantCount}명`
      : "미입력";
  const regionText = hasText(log.region) ? log.region.trim() : "미입력";
  const scheduleText = hasText(log.expectedDate) ? log.expectedDate.trim() : "미입력";
  const purposeText = hasText(log.purpose) ? log.purpose.trim() : "미입력";
  const contactNameText = hasText(log.contactName) ? log.contactName.trim() : "미입력";
  const phoneText = hasText(log.contactPhone) ? log.contactPhone.trim() : "미입력";
  const emailText = hasText(log.contactEmail) ? log.contactEmail.trim() : "미입력";

  return [
    `[카테고리] ${categoryText}`,
    `[인원/지역/일정] ${participantText} / ${regionText} / ${scheduleText}`,
    `[목적] ${purposeText}`,
    `[연락처] ${contactNameText} / ${phoneText} / ${emailText}`,
  ].join("\n");
}

function buildInquiryMessage(log: {
  summary: string | null;
  region: string | null;
  specialRequests: string | null;
}): string {
  const parts: string[] = ["AI 상담 자동 문의로 생성되었습니다."];

  if (hasText(log.summary)) {
    parts.push(`[상담 요약]\n${log.summary.trim()}`);
  }
  if (hasText(log.region)) {
    parts.push(`희망 지역: ${log.region.trim()}`);
  }
  if (hasText(log.specialRequests)) {
    parts.push(`특별 요구사항: ${log.specialRequests.trim()}`);
  }

  return parts.join("\n\n").slice(0, INQUIRY_MESSAGE_MAX_LENGTH);
}

/**
 * AI 상담 리드를 문의(Inquiry)로 자동 전환합니다.
 */
export async function maybeCreateInquiryFromConsultingLog(
  consultingLogId: string
): Promise<MaybeCreateInquiryResult> {
  try {
    const log = await prisma.consultingLog.findUnique({
      where: { id: consultingLogId },
      select: {
        id: true,
        userId: true,
        sessionId: true,
        contactName: true,
        contactPhone: true,
        contactEmail: true,
        category: true,
        participantCount: true,
        region: true,
        expectedDate: true,
        purpose: true,
        hasInstructor: true,
        preferredTransport: true,
        mealPreference: true,
        specialRequests: true,
        estimatedBudget: true,
        summary: true,
        convertedToInquiry: true,
        user: {
          select: {
            school: true,
          },
        },
      },
    });

    if (!log) {
      return { success: false, created: false, reason: "not_found" };
    }

    if (log.convertedToInquiry) {
      return { success: true, created: false, reason: "already_converted" };
    }

    const contactName = hasText(log.contactName) ? log.contactName.trim() : "";
    const contactPhone = normalizePhone(log.contactPhone);
    const contactEmail = normalizeEmail(log.contactEmail);

    if (!contactName) {
      return { success: true, created: false, reason: "insufficient_name" };
    }

    if (!contactPhone && !contactEmail) {
      return { success: true, created: false, reason: "insufficient_contact" };
    }

    const signalCount = countQualificationSignals(log);
    if (signalCount < 2) {
      return {
        success: true,
        created: false,
        reason: "insufficient_context",
        signalCount,
      };
    }

    const existingBySession = await prisma.inquiry.findUnique({
      where: { sourceSessionId: log.sessionId },
      select: { id: true },
    });

    if (existingBySession) {
      return {
        success: true,
        created: false,
        reason: "duplicate_session",
        existingInquiryId: existingBySession.id,
      };
    }

    const contactOr: Prisma.InquiryWhereInput[] = [];
    if (contactPhone) contactOr.push({ phone: contactPhone });
    if (contactEmail) contactOr.push({ email: contactEmail });

    if (contactOr.length > 0) {
      const recentThreshold = new Date(Date.now() - RECENT_DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000);
      const existingRecent = await prisma.inquiry.findFirst({
        where: {
          sourceType: "ai_consulting",
          createdAt: { gte: recentThreshold },
          sourceSessionId: { not: log.sessionId },
          OR: contactOr,
        },
        select: { id: true },
        orderBy: { createdAt: "desc" },
      });

      if (existingRecent) {
        return {
          success: true,
          created: false,
          reason: "duplicate_recent_contact",
          existingInquiryId: existingRecent.id,
        };
      }
    }

    const schoolName = hasText(log.user?.school)
      ? log.user.school.trim()
      : "AI 상담 자동 접수";

    const aiSummary = buildAiInquirySummary({
      category: log.category,
      participantCount: log.participantCount,
      region: log.region,
      expectedDate: log.expectedDate,
      purpose: log.purpose,
      contactName: log.contactName,
      contactPhone: log.contactPhone,
      contactEmail: log.contactEmail,
    });

    const message = buildInquiryMessage({
      summary: log.summary,
      region: log.region,
      specialRequests: log.specialRequests,
    });

    const inquiryBudget = toInquiryBudget(log.estimatedBudget);

    const result = await prisma.$transaction(async (tx) => {
      const existingSessionInTx = await tx.inquiry.findUnique({
        where: { sourceSessionId: log.sessionId },
        select: { id: true },
      });

      if (existingSessionInTx) {
        return { inquiry: null, existingInquiryId: existingSessionInTx.id };
      }

      const inquiry = await tx.inquiry.create({
        data: {
          userId: log.userId,
          sourceType: "ai_consulting",
          sourceSessionId: log.sessionId,
          consultingLogId: log.id,
          autoCreated: true,
          aiSummary,
          schoolName,
          contact: contactName,
          phone: contactPhone,
          email: contactEmail,
          message,
          expectedDate: hasText(log.expectedDate) ? log.expectedDate.trim() : null,
          participantCount: log.participantCount,
          purpose: hasText(log.purpose) ? log.purpose.trim() : null,
          hasInstructor: log.hasInstructor,
          preferredTransport: hasText(log.preferredTransport)
            ? log.preferredTransport.trim()
            : null,
          mealPreference: hasText(log.mealPreference) ? log.mealPreference.trim() : null,
          specialRequests: hasText(log.specialRequests)
            ? log.specialRequests.trim()
            : null,
          estimatedBudget: inquiryBudget,
          status: "pending",
        },
        select: { id: true },
      });

      await tx.consultingLog.update({
        where: { id: log.id },
        data: {
          convertedToInquiry: true,
          convertedAt: new Date(),
        },
      });

      return { inquiry, existingInquiryId: null };
    });

    if (!result.inquiry) {
      return {
        success: true,
        created: false,
        reason: "duplicate_session",
        existingInquiryId: result.existingInquiryId || undefined,
      };
    }

    return {
      success: true,
      created: true,
      inquiryId: result.inquiry.id,
      signalCount,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: true,
        created: false,
        reason: "duplicate_session",
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("자동 문의 생성 실패:", errorMessage);

    return {
      success: false,
      created: false,
      reason: "create_failed",
      error: errorMessage,
    };
  }
}

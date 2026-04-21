"use server";

import { prisma } from "./prisma";
import { Resend } from "resend";
import { sendConsultingCompleteAlimtalk } from "./kakao-alimtalk";
import { sendPersonalizedRecommendationsIfOptedIn } from "./personalized-recommendations";
import { getCategoryDetailKey, getCategoryKey } from "./category-utils";
import type { Prisma } from "@prisma/client";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface ConsultingSummary {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  category: string;
  participantCount?: number;
  region?: string;
  expectedDate?: string;
  purpose?: string;
  hasInstructor?: boolean;
  preferredTransport?: string;
  mealPreference?: string;
  specialRequests?: string;
  estimatedBudget?: number;
  estimatedQuote?: string;
  canQuoteImmediately?: boolean;
}

function escapeHtml(value: unknown): string {
  const text = String(value ?? "");
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlWithLineBreaks(value: unknown): string {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

function formatBudget(value?: number): string {
  if (typeof value !== "number") return "미입력";
  return `${value.toLocaleString("ko-KR")}원`;
}

function normalizeCategoryForSearch(rawCategory?: string): string | undefined {
  if (!rawCategory) return undefined;

  const normalized = rawCategory.replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;

  const compact = normalized.replace(/\s+/g, "");

  const exactKey = getCategoryDetailKey(normalized);
  if (exactKey) return exactKey;

  const compactKey = getCategoryDetailKey(compact);
  if (compactKey) return compactKey;

  const displayKey = getCategoryKey(normalized);
  if (displayKey) return displayKey;

  if (compact.includes("체험학습")) return "체험학습";
  if (compact.includes("국내외교육여행") || compact.includes("해외수학여행")) return "국내외교육여행";
  if (compact.includes("수련활동")) return "수련활동";
  if (compact.includes("교사연수")) return "교사연수";
  if (compact.includes("해외취업") || compact.includes("유학")) return "해외취업및유학";
  if (compact.includes("rise") || compact.includes("지자체") || compact.includes("대학")) {
    return "지자체및대학RISE사업";
  }
  if (compact.includes("특성화고")) return "특성화고교프로그램";
  if (compact.includes("기타")) return "기타프로그램";

  return undefined;
}

function extractRegionTokens(rawRegion: string): string[] {
  const normalized = rawRegion.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const stopwords = new Set([
    "한국",
    "국내",
    "해외",
    "지역",
    "희망",
    "인근",
    "근교",
  ]);

  const tokens = normalized
    .split(/[\/,|>]/)
    .flatMap((part) => part.split(/\s+/))
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stopwords.has(token));

  return Array.from(new Set(tokens));
}

/**
 * 상담 로그 저장
 */
export async function saveConsultingLog(data: {
  sessionId: string;
  userId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  category?: string;
  participantCount?: number;
  region?: string;
  expectedDate?: string;
  purpose?: string;
  hasInstructor?: boolean;
  preferredTransport?: string;
  mealPreference?: string;
  specialRequests?: string;
  estimatedBudget?: number;
  estimatedQuote?: string;
  canQuoteImmediately?: boolean;
  conversation: Array<{ role: string; content: string; timestamp: string }>;
  summary?: string;
}) {
  try {
    const log = await prisma.consultingLog.create({
      data: {
        sessionId: data.sessionId,
        userId: data.userId,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        category: data.category,
        participantCount: data.participantCount,
        region: data.region,
        expectedDate: data.expectedDate,
        purpose: data.purpose,
        hasInstructor: data.hasInstructor,
        preferredTransport: data.preferredTransport,
        mealPreference: data.mealPreference,
        specialRequests: data.specialRequests,
        estimatedBudget: data.estimatedBudget ? BigInt(data.estimatedBudget) : null,
        estimatedQuote: data.estimatedQuote,
        canQuoteImmediately: data.canQuoteImmediately || false,
        conversation: data.conversation as any,
        summary: data.summary,
      },
    });

    // 카카오 알림톡 발송 (전화번호가 있는 경우)
    if (data.contactPhone && data.summary) {
      try {
        const kakaoResult = await sendConsultingCompleteAlimtalk(
          data.contactPhone.replace(/[^0-9]/g, ""), // 하이픈 제거
          data.category || "미선택",
          data.summary
        );

        if (kakaoResult.success) {
          await prisma.consultingLog.update({
            where: { id: log.id },
            data: { kakaoSent: true, kakaoSentAt: new Date() },
          });
        } else {
          console.warn("카카오 알림톡 발송 실패 (무시):", kakaoResult.error);
        }
      } catch (error) {
        console.error("카카오 알림톡 발송 실패 (무시):", error);
      }
    }

    // 로그인 사용자는 상담 데이터를 기반으로 개인화 추천 알림 발송 시도(수신동의 기반)
    if (data.userId) {
      try {
        await sendPersonalizedRecommendationsIfOptedIn(data.userId);
      } catch (error) {
        console.warn("개인화 추천 알림 발송 실패 (무시):", error);
      }
    }

    return { success: true, id: log.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("상담 로그 저장 실패:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 상담 요약 이메일 발송
 */
export async function sendConsultingSummaryEmail(summary: ConsultingSummary) {
  try {
    if (!resend) {
      console.log("📧 상담 요약 이메일 (개발 모드):", summary);
      return { success: true, skipped: true };
    }

    const adminEmail =
      process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || "syh2123@naver.com";
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const adminConsultingUrl = `${baseUrl}/admin`;
    const adminInquiriesUrl = `${baseUrl}/admin/inquiries`;
    const contactPhoneDigits = summary.contactPhone?.replace(/\D/g, "");
    const contactPhoneHref = contactPhoneDigits ? `tel:${contactPhoneDigits}` : "";
    const contactEmailHref = summary.contactEmail ? `mailto:${summary.contactEmail}` : "";

    const categoryText = summary.category || "미선택";
    const regionText = summary.region || "미입력";
    const participantText = summary.participantCount ? `${summary.participantCount}명` : "미입력";
    const purposeText = summary.purpose || "미입력";
    const scheduleText = summary.expectedDate || "미입력";
    const instructorText =
      summary.hasInstructor !== undefined
        ? summary.hasInstructor
          ? "필요"
          : "불필요"
        : "미입력";
    const transportText = summary.preferredTransport || "미입력";
    const mealText = summary.mealPreference || "없음";
    const specialText = summary.specialRequests || "없음";
    const quoteText = summary.estimatedQuote || "미입력";
    const immediateQuoteText = summary.canQuoteImmediately ? "가능" : "추가 확인 필요";
    const budgetText = formatBudget(summary.estimatedBudget);

    const summaryText = `[고객 유형/카테고리]
${categoryText}

[예상 인원 및 지역]
인원: ${participantText}
지역: ${regionText}
일정: ${scheduleText}

[연락처]
담당자명: ${summary.contactName || "미입력"}
전화번호: ${summary.contactPhone || "미입력"}
이메일: ${summary.contactEmail || "미입력"}

[핵심 요구사항 및 커스텀 요청]
목적/성격: ${purposeText}
인솔자: ${instructorText}
이동수단: ${transportText}
식사 취향: ${mealText}
특별 요구사항: ${specialText}

[견적 정보]
예상 예산: ${budgetText}
예상 견적가: ${quoteText}
즉시 견적 가능: ${immediateQuoteText}`;

    const renderRow = (label: string, value: string, isMultiline = false) => `
      <tr>
        <td style="padding: 10px 0; width: 140px; color: #5f6368; font-weight: 600; vertical-align: top;">${escapeHtml(label)}</td>
        <td style="padding: 10px 0; color: #202124; line-height: 1.5;">
          ${isMultiline ? escapeHtmlWithLineBreaks(value) : escapeHtml(value)}
        </td>
      </tr>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "no-reply@touchtheworld.co.kr",
      to: adminEmail,
      ...(summary.contactEmail ? { replyTo: summary.contactEmail } : {}),
      subject: `[AI 상담 리드] ${categoryText} / ${regionText} / ${participantText}`,
      text: summaryText,
      html: `
        <div style="margin: 0; padding: 24px 0; background: #f3f6f4; font-family: Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color: #202124;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 720px; margin: 0 auto;">
            <tr>
              <td style="padding: 0 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #d7e4dc; border-radius: 14px; overflow: hidden;">
                  <tr>
                    <td style="padding: 20px 24px; background: #2E6D45; color: #ffffff;">
                      <div style="font-size: 12px; opacity: 0.92; margin-bottom: 6px;">Touch The World · AI Consulting Lead</div>
                      <div style="font-size: 22px; font-weight: 700; line-height: 1.3;">AI 상담 리드가 접수되었습니다</div>
                      <div style="font-size: 13px; opacity: 0.9; margin-top: 8px;">${escapeHtml(categoryText)} / ${escapeHtml(regionText)} / ${escapeHtml(participantText)}</div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 20px 24px 10px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8faf8; border: 1px solid #e3ece7; border-radius: 10px; padding: 12px;">
                        ${renderRow("담당자명", summary.contactName || "미입력")}
                        ${renderRow("전화번호", summary.contactPhone || "미입력")}
                        ${renderRow("이메일", summary.contactEmail || "미입력")}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 8px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #edf2ef;">
                        ${renderRow("카테고리", categoryText)}
                        ${renderRow("예상 인원", participantText)}
                        ${renderRow("희망 지역", regionText)}
                        ${renderRow("희망 일정", scheduleText)}
                        ${renderRow("목적/성격", purposeText)}
                        ${renderRow("인솔자 필요", instructorText)}
                        ${renderRow("이동수단", transportText)}
                        ${renderRow("식사 취향", mealText)}
                        ${renderRow("특별 요구사항", specialText, true)}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 8px 24px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8faf8; border: 1px solid #e3ece7; border-radius: 10px; padding: 12px;">
                        ${renderRow("예상 예산", budgetText)}
                        ${renderRow("예상 견적가", quoteText, true)}
                        ${renderRow("즉시 견적 가능", immediateQuoteText)}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 0 24px 24px;">
                      <div style="text-align: center;">
                        <a href="${adminConsultingUrl}"
                           style="display: inline-block; margin: 0 4px 8px; padding: 11px 16px; background: #2E6D45; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
                          관리자에서 확인
                        </a>
                        <a href="${adminInquiriesUrl}"
                           style="display: inline-block; margin: 0 4px 8px; padding: 11px 16px; background: #ffffff; color: #2E6D45; border: 1px solid #2E6D45; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
                          문의 목록 바로가기
                        </a>
                        ${contactPhoneHref
                          ? `<a href="${contactPhoneHref}"
                               style="display: inline-block; margin: 0 4px 8px; padding: 11px 16px; background: #ffffff; color: #2E6D45; border: 1px solid #2E6D45; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
                               전화 연결
                             </a>`
                          : ""}
                        ${contactEmailHref
                          ? `<a href="${contactEmailHref}"
                               style="display: inline-block; margin: 0 4px 8px; padding: 11px 16px; background: #ffffff; color: #2E6D45; border: 1px solid #2E6D45; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
                               이메일 작성
                             </a>`
                          : ""}
                      </div>
                      <div style="margin-top: 14px; font-size: 12px; color: #7a8288; text-align: center;">
                        이 메일은 AI 상담 대화에서 자동 생성되었습니다.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    if (error) {
      throw new Error(`이메일 발송 실패: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("이메일 발송 실패:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * 고객 요구사항에 맞는 프로그램 검색
 */
export async function searchPrograms(criteria: {
  category?: string;
  region?: string;
  participantCount?: number;
  purpose?: string;
  estimatedBudget?: number;
  limit?: number;
}) {
  try {
    const where: Prisma.ProgramWhereInput = {};

    // 카테고리 필터
    const normalizedCategory = normalizeCategoryForSearch(criteria.category);
    if (normalizedCategory) {
      where.category = normalizedCategory;
    }

    // 지역 필터 (부분 일치)
    if (criteria.region) {
      const regionTokens = extractRegionTokens(criteria.region);
      const regionCandidates = regionTokens.length > 0 ? regionTokens : [criteria.region];

      where.OR = regionCandidates.flatMap((candidate) => [
        { region: { contains: candidate, mode: "insensitive" as const } },
        { hashtags: { hasSome: [candidate] } },
      ]);
    }

    // 목적/성격 필터 (제목, 요약, 설명에서 검색)
    if (criteria.purpose) {
      const purposeWhere: Prisma.ProgramWhereInput = {
        OR: [
          { title: { contains: criteria.purpose, mode: "insensitive" as const } },
          { summary: { contains: criteria.purpose, mode: "insensitive" as const } },
          { description: { contains: criteria.purpose, mode: "insensitive" as const } },
        ],
      };
      
      if (where.OR) {
        // 이미 OR 조건이 있으면 AND로 결합
        where.AND = [
          { OR: where.OR },
          purposeWhere,
        ];
        delete where.OR;
      } else {
        Object.assign(where, purposeWhere);
      }
    }

    // 예산 필터 (인원당 예산 계산)
    if (criteria.estimatedBudget && criteria.participantCount) {
      const budgetPerPerson = criteria.estimatedBudget / criteria.participantCount;
      where.OR = where.OR || [];
      where.OR.push(
        { priceTo: { lte: budgetPerPerson * 1.2 } }, // 예산의 120% 이하
        { priceFrom: { gte: budgetPerPerson * 0.8 } }, // 예산의 80% 이상
        { AND: [
          { priceFrom: { lte: budgetPerPerson * 1.2 } },
          { priceTo: { gte: budgetPerPerson * 0.8 } },
        ]}
      );
    } else if (criteria.estimatedBudget) {
      // 인원 정보가 없으면 전체 예산으로 필터링
      where.OR = where.OR || [];
      where.OR.push(
        { priceTo: { lte: criteria.estimatedBudget * 1.2 } },
        { priceFrom: { gte: criteria.estimatedBudget * 0.8 } },
      );
    }

    const programs = await prisma.program.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
      take: criteria.limit || 5,
      orderBy: [
        { rating: "desc" },
        { reviewCount: "desc" },
        { createdAt: "desc" },
      ],
    });

    return {
      success: true,
      programs: programs.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        summary: p.summary,
        region: p.region,
        priceFrom: p.priceFrom,
        priceTo: p.priceTo,
        rating: p.rating,
        reviewCount: p.reviewCount,
        thumbnailUrl: p.thumbnailUrl,
        imageUrl: p.images[0]?.url,
      })),
      count: programs.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("프로그램 검색 실패:", errorMessage);
    return { success: false, error: errorMessage, programs: [], count: 0 };
  }
}

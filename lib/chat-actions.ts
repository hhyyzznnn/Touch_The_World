"use server";

import { prisma } from "./prisma";
import { Resend } from "resend";
import { COMPANY_INFO } from "./constants";
import { sendConsultingCompleteAlimtalk } from "./kakao-alimtalk";
import type { Prisma } from "@prisma/client";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface ConsultingSummary {
  category: string;
  participantCount?: number;
  region?: string;
  purpose?: string;
  hasInstructor?: boolean;
  preferredTransport?: string;
  mealPreference?: string;
  specialRequests?: string;
  estimatedBudget?: number;
  estimatedQuote?: string;
  canQuoteImmediately?: boolean;
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

    const summaryText = `[고객 유형/카테고리]
${summary.category || "미선택"}

[예상 인원 및 지역]
인원: ${summary.participantCount ? `${summary.participantCount}명` : "미입력"}
지역: ${summary.region || "미입력"}

[핵심 요구사항 및 커스텀 요청]
목적/성격: ${summary.purpose || "미입력"}
인솔자: ${summary.hasInstructor !== undefined ? (summary.hasInstructor ? "필요" : "불필요") : "미입력"}
이동수단: ${summary.preferredTransport || "미입력"}
식사 취향: ${summary.mealPreference || "없음"}
특별 요구사항: ${summary.specialRequests || "없음"}

[견적 정보]
예상 예산: ${summary.estimatedBudget ? `${(Number(summary.estimatedBudget) / 10000).toFixed(0)}만원` : "미입력"}
예상 견적가: ${summary.estimatedQuote || "미입력"}
즉시 견적 가능: ${summary.canQuoteImmediately ? "가능" : "추가 확인 필요"}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "no-reply@touchtheworld.co.kr",
      to: "yejun4831@gmail.com", // 기능 구현 완료 전까지 테스트용
      subject: `[AI 상담 리드] ${summary.category || "신규 문의"} - ${summary.region || "지역 미입력"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E6D45;">AI 상담 리드 알림</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${summaryText}</pre>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            이 이메일은 AI 채팅 상담에서 자동으로 생성되었습니다.
          </p>
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
    if (criteria.category) {
      where.category = criteria.category;
    }

    // 지역 필터 (부분 일치)
    if (criteria.region) {
      where.OR = [
        { region: { contains: criteria.region, mode: "insensitive" as const } },
        { hashtags: { hasSome: [criteria.region] } },
      ];
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

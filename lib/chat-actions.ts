"use server";

import { prisma } from "./prisma";
import { Resend } from "resend";
import { COMPANY_INFO } from "./constants";
import { sendConsultingCompleteAlimtalk } from "./kakao-alimtalk";

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
        await sendConsultingCompleteAlimtalk(
          data.contactPhone.replace(/[^0-9]/g, ""), // 하이픈 제거
          data.category || "미선택",
          data.summary
        );
        await prisma.consultingLog.update({
          where: { id: log.id },
          data: { kakaoSent: true, kakaoSentAt: new Date() },
        });
      } catch (error) {
        console.error("카카오 알림톡 발송 실패 (무시):", error);
      }
    }

    return { success: true, id: log.id };
  } catch (error: any) {
    console.error("상담 로그 저장 실패:", error);
    return { success: false, error: error.message };
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
  } catch (error: any) {
    console.error("이메일 발송 실패:", error);
    return { success: false, error: error.message };
  }
}


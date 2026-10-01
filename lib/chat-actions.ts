"use server";

import { prisma } from "./prisma";
import { Resend } from "resend";
import { sendConsultingCompleteAlimtalk } from "./kakao-alimtalk";
import { sendPersonalizedRecommendationsIfOptedIn } from "./personalized-recommendations";
import { COMPANY_INFO } from "./constants";
import { PROGRAM_CATEGORIES, HASHTAG_REGIONS } from "./news-constants";
import { CompanyNewsType, type Prisma } from "@prisma/client";

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

// searchPrograms가 실제로 검색하는 CompanyNews(PROGRAM_CARD_NEWS)는 lib/news-constants.ts의
// 8개 공식 카테고리(PROGRAM_CATEGORIES)만 사용한다. 이건 예전 Program 테이블이 쓰던 카테고리
// 체계(category-utils.ts, "특성화고교프로그램" 등)와 철자·구성이 다르게 갈라져 있어서 그대로
// 재사용하면 또 다른 매칭 누락 버그가 생긴다 — 카드뉴스용으로 별도 매핑을 둔다.
// AI/사용자가 보낸 문구가 8개 중 어디에도 확실히 안 맞으면 빈 배열을 반환해 카테고리 필터를
// 생략하게 한다(틀린 카테고리로 단정해 0건을 만드는 것보다, 지역/목적만으로라도 찾는 게 안전).
function normalizeCategoryForCardNews(rawCategory?: string): string[] {
  if (!rawCategory) return [];

  const normalized = rawCategory.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const compact = normalized.replace(/\s+/g, "");

  const exact = PROGRAM_CATEGORIES.find(
    (cat) => cat === normalized || cat.replace(/\s+/g, "") === compact
  );
  if (exact) return [exact];

  if (compact.includes("특성화고")) return ["특성화고 프로그램"];
  if (compact.includes("유학")) return ["일본 유학"];
  if (compact.includes("수련")) return ["수련활동"];
  if (compact.includes("교사") || compact.includes("교직원") || compact.includes("연수")) {
    return ["교사 연수"];
  }
  if (compact.includes("체험")) return ["체험학습"];
  if (compact.includes("기타")) return ["기타 프로그램"];

  const mentionsDomestic = compact.includes("국내");
  const mentionsOverseas = compact.includes("국외") || compact.includes("해외");
  if (mentionsDomestic && mentionsOverseas) return ["국내 교육여행", "국외 교육여행"];
  if (mentionsOverseas) return ["국외 교육여행"];
  if (mentionsDomestic) return ["국내 교육여행"];
  if (compact.includes("교육여행") || compact.includes("수학여행")) {
    return ["국내 교육여행", "국외 교육여행"];
  }

  return [];
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

// "힐링과 휴식", "역사 탐방이나 자연 체험"처럼 AI가 자연스러운 한국어 문구로 purpose를
// 보내면, 전체 문구가 카드뉴스 본문에 토씨 하나 안 틀리고 그대로 있어야만 매칭되던 문제가
// 있었다(참가 인원 재확인 버그와 같은 유형). 공백·구두점으로 나누고, 흔한 연결 조사
// (이나/이며/및/또는/과/와/나)가 끝에 붙은 조각은 벗겨내 핵심 키워드 단위로도 매칭한다.
function extractPurposeTokens(rawPurpose: string): string[] {
  const normalized = rawPurpose.replace(/[·,\/]/g, " ").trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/).filter(Boolean);
  const stripped = words.map((w) => w.replace(/(이나|이며|및|또는|과|와|나)$/, ""));

  return Array.from(
    new Set([...words, ...stripped].map((t) => t.trim()).filter((t) => t.length >= 2))
  );
}

// 카드뉴스 hashtags(예: ["#일본", "#학생"])에서 지역 태그 하나를 골라 표시용 문자열로 변환.
function extractDisplayRegion(hashtags: string[]): string | undefined {
  const found = hashtags.find((tag) => HASHTAG_REGIONS.includes(tag.replace(/^#/, "") as (typeof HASHTAG_REGIONS)[number]));
  return found?.replace(/^#/, "");
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
      process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || COMPANY_INFO.email;
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
 *
 * 2026-10-02: 예전엔 거의 관리되지 않는 레거시 Program 테이블(17건)을 검색하고 있었는데,
 * 정작 /programs에서 방문자가 보는 실제 카탈로그는 CompanyNews(PROGRAM_CARD_NEWS)였다 —
 * 챗봇이 추천하는 풀과 사이트에 실제로 올라와 있는 콘텐츠가 서로 다른 셈이었다.
 * 이제 CompanyNews를 직접 검색한다. 이 테이블엔 가격/평점 필드가 없어 estimatedBudget은
 * 더 이상 필터링에 쓰지 않는다(필요하면 상담 단계에서 사람이 직접 안내).
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
    const where: Prisma.CompanyNewsWhereInput = {
      type: CompanyNewsType.PROGRAM_CARD_NEWS,
    };

    // 카테고리 필터 — 8개 공식 카테고리 중 하나로 매핑되는 경우에만 적용.
    // 애매한 문구는 아예 필터링하지 않고 지역/목적 조건만으로 찾는다(틀리게 단정해서
    // 0건 만드는 것보다 안전).
    const matchedCategories = normalizeCategoryForCardNews(criteria.category);
    if (matchedCategories.length > 0) {
      where.categories = { hasSome: matchedCategories };
    }

    const andConditions: Prisma.CompanyNewsWhereInput[] = [];

    // 지역 필터 — 해시태그(#서울 등) 우선, 보강으로 제목/요약 부분 일치도 함께 확인
    if (criteria.region) {
      const regionTokens = extractRegionTokens(criteria.region);
      const regionCandidates = regionTokens.length > 0 ? regionTokens : [criteria.region];

      andConditions.push({
        OR: regionCandidates.flatMap((candidate) => [
          { hashtags: { hasSome: [`#${candidate}`, candidate] } },
          { title: { contains: candidate, mode: "insensitive" as const } },
          { summary: { contains: candidate, mode: "insensitive" as const } },
        ]),
      });
    }

    // 목적/성격 필터 — 제목·요약뿐 아니라 본문(content, 실제 소개 문구가 풍부한 마크다운)까지 검색
    if (criteria.purpose) {
      const purposeTokens = extractPurposeTokens(criteria.purpose);
      const purposeCandidates = purposeTokens.length > 0 ? purposeTokens : [criteria.purpose];

      andConditions.push({
        OR: purposeCandidates.flatMap((candidate) => [
          { title: { contains: candidate, mode: "insensitive" as const } },
          { summary: { contains: candidate, mode: "insensitive" as const } },
          { content: { contains: candidate, mode: "insensitive" as const } },
        ]),
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const items = await prisma.companyNews.findMany({
      where,
      take: criteria.limit || 5,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      programs: items.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.categories[0],
        summary: item.summary ?? undefined,
        region: extractDisplayRegion(item.hashtags),
        // CompanyNews엔 가격/평점 데이터가 없음 — 아래 route.ts 포맷팅 로직이
        // undefined/0을 "가격 문의"·"평점 없음"으로 안전하게 표시한다.
        priceFrom: undefined as number | undefined,
        priceTo: undefined as number | undefined,
        rating: undefined as number | undefined,
        reviewCount: 0,
        thumbnailUrl: item.imageUrl ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
      })),
      count: items.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("프로그램 검색 실패:", errorMessage);
    return { success: false, error: errorMessage, programs: [], count: 0 };
  }
}

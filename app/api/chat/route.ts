import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { saveConsultingLog, sendConsultingSummaryEmail } from "@/lib/chat-actions";
import { buildChatKnowledge } from "@/lib/chat-knowledge";
import { appendMissingSourceLinks, stripMarkdown } from "@/lib/chat-text";
import { maybeCreateInquiryFromConsultingLog } from "@/lib/inquiry-conversion";
import { prisma } from "@/lib/prisma";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { z } from "zod";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth-user";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2026-11 같은 대화 5개로 비교: gpt-4.1-mini는 게시물 내용을 섞어 답하는 일이 있었고, gpt-5.5는 자세하지만
// 느리고(5~11초) 근거 없는 말을 덧붙였다. gpt-5.4-mini가 자연스러우면서 게시물을 정확히 쓰고 빨랐다(1~5초).
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-5.4-mini";

const EMAIL_MATCH_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_MATCH_REGEX = /(?:\+?82[-\s]?)?0?1[016789][-\s]?\d{3,4}[-\s]?\d{4}/g;
const EMAIL_TEST_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_TEST_REGEX = /(?:\+?82[-\s]?)?0?1[016789][-\s]?\d{3,4}[-\s]?\d{4}/;
const CATEGORY_REDISPLAY_REGEX =
  /(?:카테고리|유형|프로그램).*(?:다시|재|보여|목록|선택)|(?:다시|재).*(?:카테고리|유형|목록)|카테고리\s*보여/i;

type ChatRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface ExtractedContact {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("82") ? `0${digits.slice(2)}` : digits;

  if (normalized.length === 11) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7)}`;
  }
  if (normalized.length === 10) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }
  return phone;
}

function extractContactInfo(messages: ChatRequestMessage[]): ExtractedContact {
  const userText = messages
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content)
    .join("\n");

  const emails = userText.match(EMAIL_MATCH_REGEX);
  const phones = userText.match(PHONE_MATCH_REGEX);
  const nameMatch = userText.match(
    /(?:이름|성함|담당자)\s*(?:은|는|:)?\s*([가-힣A-Za-z]{2,20})/
  );
  // "김민지이고"/"김민지입니다"처럼 이름 뒤에 서술격 조사가 공백 없이 붙어 캡처되는 경우를 정리
  const contactName = nameMatch?.[1]?.replace(
    /(이에요|이고요|입니다만|입니다|이고|이며|이야)$/,
    ""
  );

  return {
    contactEmail: emails?.[emails.length - 1]?.trim(),
    contactPhone: phones?.[phones.length - 1]
      ? normalizePhone(phones[phones.length - 1])
      : undefined,
    contactName,
  };
}

function wantsCategoryRedisplay(messages: ChatRequestMessage[]): boolean {
  const lastUserMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === "user")
    ?.content?.trim();

  if (!lastUserMessage) return false;
  if (/(필요없|괜찮|아니야|말고)/.test(lastUserMessage)) return false;

  return CATEGORY_REDISPLAY_REGEX.test(lastUserMessage);
}


const getSystemPrompt = (knowledgeBlock: string, landingCategory?: string): string => {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const landing = landingCategory
    ? `\n- 상대는 "${landingCategory}" 페이지에서 들어왔습니다. 유형을 다시 묻지 말고 그 맥락에서 시작하세요.`
    : "";

  // 2026-11: 예외 상황마다 규칙을 덧붙이던 지침이 수십 줄로 늘어 대화가 딱딱해져(지적·되묻기·정해진 질문 반복),
  // "경험 많은 상담 실장" 역할과 원칙만 남기고 사실 근거 규칙 하나만 엄격하게 둔다.
  return [
    "당신은 1996년부터 학교 교육여행을 만들어 온 (주)터치더월드의 상담 실장입니다. 선생님과 통화하듯 자연스럽고 따뜻하게 대화하세요.",
    "",
    "[대화 방식]",
    "- 상대가 방금 한 말에 먼저 답하세요. 버튼으로 고른 유형보다 실제로 말한 내용(지역·학년·인원·기간·목적)이 우선이고, 둘이 맞지 않으면 지적하지 말고 말한 내용에 맞춰 이어가세요.",
    "- 이미 들은 정보는 다시 묻지 말고, 다음에 꼭 필요한 것 한두 가지만 물으세요. 답이 충분하면 질문 없이 마쳐도 됩니다.",
    "- 일정이나 구성을 부탁받으면 바로 초안을 보여 주세요(일차별 한 줄). 맞는 우리 프로그램이 있으면 그것을 바탕으로, 없으면 일반적인 예시로 보여 주고 '예시'라고 밝히세요.",
    "- 짧게 답하세요(대개 3~6문장, 필요할 때만 목록). 마크다운 기호(**, #, [텍스트](링크))는 쓰지 말고 링크는 주소를 그대로 적으세요.",
    landing,
    "",
    "[우리 프로그램 정보]",
    "- 아래 '전체 프로그램·소식 목록'은 홈페이지에 올라간 터치더월드의 모든 프로그램입니다. 상대 조건에 맞는 것이 있으면 먼저 소개하고 제목과 주소를 알려 주세요.",
    "- 우리 프로그램의 일정·가격·혜택·신청 기간·대상은 게시물에 적힌 내용만 말하세요. 적혀 있지 않으면 '담당자가 확인해 드릴게요(1800-8078)'라고 하세요. 일반적인 여행지 정보나 준비 요령은 상식 수준에서 말해도 됩니다.",
    "- 게시물마다 구분해 말하고 서로 섞지 마세요. 특정 학교 사례는 '진행 사례'라고 밝히세요.",
    `- 오늘은 ${today}입니다. 마감·신청 기간이 지난 게시물을 말할 때는 그 사실을 먼저 알리세요.`,
    "",
    "[상담 접수]",
    "- 견적·상담을 원하면 먼저 알맞은 프로그램이나 다음 단계를 짧게 안내하고, 담당자가 연락드릴 수 있게 성함과 연락처(전화 또는 이메일)를 자연스럽게 한 번 요청하세요.",
    "- 상대가 연락처를 남기면 saveConsultingLog를 호출해 상담을 접수하세요. 연락처 없이 대화를 마치겠다고 하면 그때도 호출해 내용만 저장하세요.",
    "",
    `회사: 주식회사 터치더월드 / 대표전화 1800-8078 / 프로그램 분류: ${PROGRAM_CATEGORIES.map((c) => c.name).join(", ")}`,
    "",
    knowledgeBlock,
  ]
    .filter((line) => line !== "")
    .join("\n")
    .replace(/\n\[/g, "\n\n[");
};

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().trim().min(1).max(3000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
  sessionId: z.string().max(200).optional(),
  landingCategory: z.string().max(100).optional(),
});

function toOpenAIMessage(
  msg: ChatRequestMessage
): OpenAI.Chat.Completions.ChatCompletionMessageParam {
  return {
    role: msg.role,
    content: msg.content,
  };
}

// 정상적인 상담에서는 닿을 일이 없는 남용 방지용 상한. 로그인 사용자는 계정 기준,
// 비로그인은 IP 기준(학교처럼 여러 명이 한 IP를 같이 쓰는 경우까지 넉넉히 감안).
const DAILY_CHAT_CAP = 1000;
const AUTO_LEAD_DUPLICATE_WINDOW_MS = 60 * 60 * 1000;

function getChatMeta(isAuthenticated: boolean) {
  return {
    isAuthenticated,
    historyEnabled: isAuthenticated,
  };
}

function findLatestPattern(source: string, pattern: RegExp): string | undefined {
  const matches = [...source.matchAll(pattern)];
  const latest = matches[matches.length - 1];
  return latest?.[0]?.trim();
}

function extractFallbackLeadDetails(
  messages: ChatRequestMessage[],
  landingCategory?: string
): {
  category?: string;
  participantCount?: number;
  region?: string;
  expectedDate?: string;
  purpose?: string;
} {
  const userMessages = messages.filter((msg) => msg.role === "user").map((msg) => msg.content.trim());
  const userText = userMessages.join("\n");
  const compactUserText = userText.replace(/\s+/g, "");

  const categoryFromMessages = PROGRAM_CATEGORIES.find((cat) =>
    compactUserText.includes(cat.name.replace(/\n/g, "").replace(/\s+/g, ""))
  )?.name.replace(/\n/g, " ");
  const category =
    landingCategory ||
    categoryFromMessages ||
    findLatestPattern(
      userText,
      // 2026-10-28 재정비한 카테고리 이름 기준 (예전 "해외 취업 및 유학"·"RISE 사업" 등은 더 이상 없음)
      /(수학여행|체험학습|교직원\s*연수|교사연수|수련활동|수련회|교육여행|일본\s*유학|유학|특성화고)/g
    );

  const participantCountRaw = findLatestPattern(userText, /(\d{1,4})\s*명/g);
  const participantCount = participantCountRaw
    ? Number(participantCountRaw.replace(/\D/g, ""))
    : undefined;

  const region = findLatestPattern(
    userText,
    /(서울|경기|인천|부산|대구|광주|대전|울산|세종|제주|강원|충북|충남|전북|전남|경북|경남|해외|일본|대만|싱가포르|베트남|중국|미국|유럽)/g
  );

  const expectedDate = findLatestPattern(
    userText,
    /(\d{4}\s*년\s*\d{1,2}\s*월(?:\s*\d{1,2}\s*일)?|\d{1,2}\s*월(?:\s*\d{1,2}\s*일)?|\d+\s*박\s*\d+\s*일|\d+\s*일)/g
  );

  const purposeCandidate = [...userMessages]
    .reverse()
    .find((message) => /(목적|진로|탐방|체험|연수|행사|프로그램|교육)/.test(message));
  const purpose =
    purposeCandidate && purposeCandidate.length <= 200
      ? purposeCandidate
      : undefined;

  return {
    category,
    participantCount: participantCount && participantCount > 0 ? participantCount : undefined,
    region,
    expectedDate,
    purpose,
  };
}

function countLeadSignals(details: {
  participantCount?: number;
  region?: string;
  expectedDate?: string;
  purpose?: string;
}) {
  let score = 0;
  if (typeof details.participantCount === "number" && details.participantCount > 0) score += 1;
  if (details.region) score += 1;
  if (details.expectedDate) score += 1;
  if (details.purpose) score += 1;
  return score;
}

function buildFallbackSummary(params: {
  category?: string;
  participantCount?: number;
  region?: string;
  expectedDate?: string;
  purpose?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}): string {
  return [
    `[카테고리] ${params.category || "미선택"}`,
    `[인원/지역/일정] ${params.participantCount ? `${params.participantCount}명` : "미입력"} / ${params.region || "미입력"} / ${params.expectedDate || "미입력"}`,
    `[목적] ${params.purpose || "미입력"}`,
    `[연락처] ${params.contactName || "미입력"} / ${params.contactPhone || "미입력"} / ${params.contactEmail || "미입력"}`,
  ].join("\n");
}

async function maybeAutoCaptureLead(params: {
  sessionId?: string;
  currentUser: Awaited<ReturnType<typeof getCurrentUser>>;
  effectiveMessages: ChatRequestMessage[];
  landingCategory?: string;
  inferredContact: ExtractedContact;
  assistantContent: string;
}) {
  const normalizedSessionId = params.sessionId?.trim();
  if (!normalizedSessionId) return;

  const contactName =
    params.inferredContact.contactName?.trim() || params.currentUser?.name || "";
  const contactPhone =
    params.inferredContact.contactPhone ||
    (params.currentUser?.phone ? normalizePhone(params.currentUser.phone) : undefined);
  const contactEmail =
    params.inferredContact.contactEmail?.trim() ||
    params.currentUser?.email ||
    undefined;

  if (!contactName || (!contactPhone && !contactEmail)) return;

  const details = extractFallbackLeadDetails(params.effectiveMessages, params.landingCategory);
  if (countLeadSignals(details) < 2) return;

  const duplicateWhereOr = [
    { convertedToInquiry: true },
    ...(contactPhone ? [{ contactPhone }] : []),
    ...(contactEmail ? [{ contactEmail }] : []),
  ];

  const existing = await prisma.consultingLog.findFirst({
    where: {
      sessionId: normalizedSessionId,
      createdAt: {
        gte: new Date(Date.now() - AUTO_LEAD_DUPLICATE_WINDOW_MS),
      },
      OR: duplicateWhereOr,
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return;

  const summary = buildFallbackSummary({
    ...details,
    contactName,
    contactPhone,
    contactEmail,
  });

  const saveResult = await saveConsultingLog({
    sessionId: normalizedSessionId,
    userId: params.currentUser?.id,
    contactName,
    contactPhone,
    contactEmail,
    category: details.category,
    participantCount: details.participantCount,
    region: details.region,
    expectedDate: details.expectedDate,
    purpose: details.purpose,
    conversation: [
      ...params.effectiveMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString(),
      })),
      {
        role: "assistant",
        content: params.assistantContent,
        timestamp: new Date().toISOString(),
      },
    ],
    summary,
    canQuoteImmediately: false,
  });

  if (!saveResult.success || !saveResult.id) return;

  void sendConsultingSummaryEmail({
    contactName,
    contactPhone,
    contactEmail,
    category: details.category || "미선택",
    participantCount: details.participantCount,
    region: details.region,
    expectedDate: details.expectedDate,
    purpose: details.purpose,
    canQuoteImmediately: false,
  }).catch((error) => {
    console.error("상담 요약 이메일 발송 실패(자동 리드 캡처):", error);
  });

  void maybeCreateInquiryFromConsultingLog(saveResult.id).catch((error) => {
    console.error("문의 자동 전환 실패(자동 리드 캡처):", error);
  });
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`chat:${clientIP}`, 30, 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const rawBody = await request.json();
    const parsedBody = chatRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "유효한 채팅 요청 형식이 아닙니다." },
        { status: 400 }
      );
    }
    const { messages, sessionId, landingCategory } = parsedBody.data;
    const currentUser = await getCurrentUser();
    const isAuthenticated = Boolean(currentUser?.id);
    const dailyRateLimit = await checkRateLimit(
      isAuthenticated ? `chat:daily:user:${currentUser!.id}` : `chat:daily:ip:${clientIP}`,
      DAILY_CHAT_CAP,
      24 * 60 * 60 * 1000
    );
    if (!dailyRateLimit.allowed) {
      return rateLimitResponse(
        dailyRateLimit,
        "오늘 AI 상담 이용량이 많아 잠시 제한되었습니다. 급하신 문의는 1800-8078로 연락 주세요.",
        { meta: getChatMeta(isAuthenticated) }
      );
    }

    // 비로그인도 현재 세션 맥락을 유지할 수 있도록 최근 대화를 제한적으로 포함
    const effectiveMessages = isAuthenticated ? messages : messages.slice(-16);
    const inferredContact = extractContactInfo(effectiveMessages);
    const shouldRedisplayCategories = wantsCategoryRedisplay(effectiveMessages);

    if (shouldRedisplayCategories) {
      return NextResponse.json({
        message: {
          role: "assistant",
          content: "네, 카테고리를 다시 보여드릴게요. 아래 버튼에서 원하시는 프로그램 유형을 선택해주세요.",
          showCategoryButtons: true,
        },
        meta: getChatMeta(isAuthenticated),
      });
    }

    const knowledge = await buildChatKnowledge(
      effectiveMessages.filter((msg) => msg.role === "user").map((msg) => msg.content),
      landingCategory
    );

    // OpenAI 메시지 형식으로 변환
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: getSystemPrompt(knowledge.promptBlock, landingCategory),
      },
      ...effectiveMessages.map(toOpenAIMessage),
    ];

    // Function Calling 정의
    const saveConsultingLogFunction: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function = {
      name: "saveConsultingLog",
      description:
        "상담 내용을 저장하고 담당자에게 요약 메일을 보냅니다. 사용자가 연락처(전화 또는 이메일)를 남겼을 때 호출하세요. " +
        "견적·상담 요청만 있고 연락처가 아직 없으면 호출하지 말고 먼저 연락처를 요청하세요. 연락처 없이 대화를 끝내겠다고 할 때만 예외로 호출합니다.",
      parameters: {
        type: "object",
        properties: {
          contactName: {
            type: "string",
            description: "담당자 이름",
          },
          contactPhone: {
            type: "string",
            description: "연락 가능한 전화번호 (예: 010-1234-5678)",
          },
          contactEmail: {
            type: "string",
            description: "연락 가능한 이메일 주소",
          },
          category: {
            type: "string",
            description: "선택한 프로그램 카테고리",
          },
          participantCount: {
            type: "number",
            description: "예상 인원 (명)",
          },
          region: {
            type: "string",
            description: "희망 지역",
          },
          expectedDate: {
            type: "string",
            description: "희망 일정 (예: 2026년 5월 셋째 주, 3박 4일)",
          },
          purpose: {
            type: "string",
            description: "여행 목적/성격",
          },
          hasInstructor: {
            type: "boolean",
            description: "인솔자 필요 여부",
          },
          preferredTransport: {
            type: "string",
            description: "선호 이동수단 (전세버스, KTX, 항공, 기타)",
          },
          mealPreference: {
            type: "string",
            description: "식사 관련 요청사항. 기본적으로는 알러지/건강상 유의사항 중심으로 기록하고, 할랄/채식은 사용자가 먼저 언급한 경우에만 기록",
          },
          specialRequests: {
            type: "string",
            description: "특별 요구사항 (알러지, 건강상 유의사항, 장애 지원, 특정 견학지 등)",
          },
          estimatedBudget: {
            type: "number",
            description: "예상 예산 (원)",
          },
          estimatedQuote: {
            type: "string",
            description: "예상 견적가 가이드 (예: 인원당 15만원, 총 300만원 예상)",
          },
          canQuoteImmediately: {
            type: "boolean",
            description: "즉시 견적 가능 여부",
          },
          summary: {
            type: "string",
            description: "상담 내용 요약 (3줄 형식: [고객 유형/카테고리], [예상 인원 및 지역], [핵심 요구사항])",
          },
        },
        required: ["summary"],
      },
    };

    const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] = [
      saveConsultingLogFunction,
    ];

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: openaiMessages,
      functions: functions,
      function_call: "auto",
      // gpt-5 계열은 temperature를 받지 않는다(기본값만 허용)
      ...(CHAT_MODEL.startsWith("gpt-4") ? { temperature: 0.4 } : {}),
    });

    const assistantMessage = completion.choices[0].message;

    // Function Calling 처리
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      let functionArgs: Record<string, unknown> = {};
      try {
        functionArgs = JSON.parse(assistantMessage.function_call.arguments || "{}");
      } catch {
        functionArgs = {};
      }

      if (functionName === "saveConsultingLog") {
        const contactName =
          typeof functionArgs.contactName === "string"
            ? functionArgs.contactName
            : inferredContact.contactName;
        const contactPhone =
          typeof functionArgs.contactPhone === "string"
            ? normalizePhone(functionArgs.contactPhone)
            : inferredContact.contactPhone;
        const contactEmail =
          typeof functionArgs.contactEmail === "string"
            ? functionArgs.contactEmail
            : inferredContact.contactEmail;

        // 상담 로그 저장
        const saveResult = await saveConsultingLog({
          sessionId: sessionId || `session_${Date.now()}`,
          userId: currentUser?.id,
          contactName,
          contactPhone,
          contactEmail,
          category: typeof functionArgs.category === "string" ? functionArgs.category : undefined,
          participantCount: typeof functionArgs.participantCount === "number" ? functionArgs.participantCount : undefined,
          region: typeof functionArgs.region === "string" ? functionArgs.region : undefined,
          expectedDate:
            typeof functionArgs.expectedDate === "string"
              ? functionArgs.expectedDate
              : typeof functionArgs.duration === "string"
                ? functionArgs.duration
                : undefined,
          purpose: typeof functionArgs.purpose === "string" ? functionArgs.purpose : undefined,
          hasInstructor: typeof functionArgs.hasInstructor === "boolean" ? functionArgs.hasInstructor : undefined,
          preferredTransport: typeof functionArgs.preferredTransport === "string" ? functionArgs.preferredTransport : undefined,
          mealPreference: typeof functionArgs.mealPreference === "string" ? functionArgs.mealPreference : undefined,
          specialRequests: typeof functionArgs.specialRequests === "string" ? functionArgs.specialRequests : undefined,
          estimatedBudget: typeof functionArgs.estimatedBudget === "number" ? functionArgs.estimatedBudget : undefined,
          estimatedQuote: typeof functionArgs.estimatedQuote === "string" ? functionArgs.estimatedQuote : undefined,
          canQuoteImmediately: typeof functionArgs.canQuoteImmediately === "boolean" ? functionArgs.canQuoteImmediately : false,
          conversation: effectiveMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date().toISOString(),
          })),
          summary: typeof functionArgs.summary === "string" ? functionArgs.summary : undefined,
        });

        // 이메일 발송 (비동기)
        if (saveResult.success) {
          void sendConsultingSummaryEmail({
            contactName,
            contactPhone,
            contactEmail,
            category: typeof functionArgs.category === "string" ? functionArgs.category : "미선택",
            participantCount: typeof functionArgs.participantCount === "number" ? functionArgs.participantCount : undefined,
            region: typeof functionArgs.region === "string" ? functionArgs.region : undefined,
            expectedDate:
              typeof functionArgs.expectedDate === "string"
                ? functionArgs.expectedDate
                : typeof functionArgs.duration === "string"
                  ? functionArgs.duration
                  : undefined,
            purpose: typeof functionArgs.purpose === "string" ? functionArgs.purpose : undefined,
            hasInstructor: typeof functionArgs.hasInstructor === "boolean" ? functionArgs.hasInstructor : undefined,
            preferredTransport: typeof functionArgs.preferredTransport === "string" ? functionArgs.preferredTransport : undefined,
            mealPreference: typeof functionArgs.mealPreference === "string" ? functionArgs.mealPreference : undefined,
            specialRequests: typeof functionArgs.specialRequests === "string" ? functionArgs.specialRequests : undefined,
            estimatedBudget: typeof functionArgs.estimatedBudget === "number" ? functionArgs.estimatedBudget : undefined,
            estimatedQuote: typeof functionArgs.estimatedQuote === "string" ? functionArgs.estimatedQuote : undefined,
            canQuoteImmediately: typeof functionArgs.canQuoteImmediately === "boolean" ? functionArgs.canQuoteImmediately : false,
          }).catch((error) => {
            console.error("상담 요약 이메일 발송 실패:", error);
          });
        }

        let inquiryConversionResult = null;
        if (saveResult.success && saveResult.id) {
          inquiryConversionResult = await maybeCreateInquiryFromConsultingLog(saveResult.id);
        }

        const saveConfirmationMessage = Boolean(contactPhone || contactEmail)
          ? inquiryConversionResult?.created
            ? typeof functionArgs.summary === "string"
              ? `상담 내용이 저장되었고 문의도 자동 접수되었습니다. 담당자가 곧 연락드리겠습니다.\n\n${functionArgs.summary}`
              : "상담 내용이 저장되었고 문의도 자동 접수되었습니다. 담당자가 곧 연락드리겠습니다."
            : typeof functionArgs.summary === "string"
              ? `상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다.\n\n${functionArgs.summary}`
              : "상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다."
          : typeof functionArgs.summary === "string"
            ? `상담 내용이 저장되었습니다.\n\n${functionArgs.summary}\n\n연락처가 확인되지 않아 담당자 배정이 보류되었습니다. 휴대폰 또는 이메일을 남겨주세요.`
            : "상담 내용이 저장되었습니다. 연락처가 확인되지 않아 담당자 배정이 보류되었습니다. 휴대폰 또는 이메일을 남겨주세요.";

        // Function 호출 후 응답 메시지 생성
        return NextResponse.json({
          message: {
            role: "assistant",
            content: saveConfirmationMessage,
            showCategoryButtons: false,
          },
          functionCall: {
            name: functionName,
            result: {
              saveResult,
              inquiryConversionResult,
            },
          },
          meta: getChatMeta(isAuthenticated),
        });
      }
    }

    // 일반 응답
    const responseContent = appendMissingSourceLinks(
      stripMarkdown(assistantMessage.content || "죄송합니다. 응답을 생성할 수 없습니다."),
      knowledge.sources
    );

    void maybeAutoCaptureLead({
      sessionId,
      currentUser,
      effectiveMessages,
      landingCategory,
      inferredContact,
      assistantContent: responseContent,
    }).catch((error) => {
      console.error("자동 리드 캡처 실패(default):", error);
    });

    return NextResponse.json({
      message: {
        role: "assistant",
        content: responseContent,
        showCategoryButtons: false,
      },
      meta: getChatMeta(isAuthenticated),
    });
  } catch (error) {
    console.error("Chat API 오류:", error);
    const details = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      {
        error: "채팅 처리 중 오류가 발생했습니다.",
        ...(process.env.NODE_ENV === "development" && details && { details }),
      },
      { status: 500 }
    );
  }
}

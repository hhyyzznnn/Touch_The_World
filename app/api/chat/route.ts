import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { saveConsultingLog, sendConsultingSummaryEmail, searchPrograms } from "@/lib/chat-actions";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { z } from "zod";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth-user";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SERVICE_CTA =
  "원하시면 지금 바로 상담 접수를 도와드릴게요. 인원, 희망 지역, 이동수단(전세버스/KTX/항공) 중 가능한 항목부터 알려주세요.";

const NO_PROGRAM_CTA =
  "조건 변경이 어렵다면 바로 상담 접수로 전환해 드릴 수 있습니다. 연락받으실 휴대폰 또는 이메일, 희망 연락 시간을 남겨주시면 담당자가 이어서 도와드립니다.";

const LOGIN_HISTORY_NOTICE =
  "로그인하면 대화 내용이 저장되어 상담을 이어볼 수 있고, 비로그인 한도(일 5회)도 해제됩니다.";

const hasActionPrompt = (text: string): boolean =>
  /(문의|접수|견적|연락|진행|재검색|조건|선택|알려주시면|말씀해주시면)/.test(text);

const hasQuestionEnding = (text: string): boolean =>
  text.includes("?") || /(까요|할까요|해주세요|주실 수 있을까요)\s*$/.test(text.trim());

const EMAIL_MATCH_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_MATCH_REGEX = /(?:\+?82[-\s]?)?0?1[016789][-\s]?\d{3,4}[-\s]?\d{4}/g;
const EMAIL_TEST_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_TEST_REGEX = /(?:\+?82[-\s]?)?0?1[016789][-\s]?\d{3,4}[-\s]?\d{4}/;

type ChatRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface ChatContextSnapshot {
  hasCategory: boolean;
  hasParticipantCount: boolean;
  hasRegion: boolean;
  hasPurpose: boolean;
  hasContact: boolean;
  hasConsultingIntent: boolean;
  userWantsToEnd: boolean;
}

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

  return {
    contactEmail: emails?.[emails.length - 1]?.trim(),
    contactPhone: phones?.[phones.length - 1]
      ? normalizePhone(phones[phones.length - 1])
      : undefined,
    contactName: nameMatch?.[1],
  };
}

function buildChatContext(
  messages: ChatRequestMessage[],
  landingCategory?: string
): ChatContextSnapshot {
  const userMessages = messages
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content);
  const userText = userMessages.join("\n");
  const compactUserText = userText.replace(/\s+/g, "");
  const normalizedCategories = PROGRAM_CATEGORIES.map((cat) =>
    cat.name.replace(/\n/g, "").replace(/\s+/g, "")
  );

  const hasCategory =
    Boolean(landingCategory) ||
    normalizedCategories.some((cat) => compactUserText.includes(cat)) ||
    /(수학여행|체험학습|교사연수|수련활동|교육여행|유학|취업|RISE|특성화고)/.test(userText);
  const hasParticipantCount = /\b\d{1,4}\s*명\b/.test(userText);
  const hasRegion =
    /(서울|경기|인천|부산|대구|광주|대전|울산|세종|제주|강원|충북|충남|전북|전남|경북|경남|해외|일본|대만|싱가포르|베트남|중국|미국|유럽)/.test(
      userText
    );
  const hasPurpose =
    /(목적|진로|탐방|체험|연수|행사|프로그램|캠프|교육)/.test(userText) &&
    userText.length > 8;
  const hasContact = EMAIL_TEST_REGEX.test(userText) || PHONE_TEST_REGEX.test(userText);
  const hasConsultingIntent = /(상담|문의|견적|연락|접수|진행)/.test(userText);
  const userWantsToEnd = /(고마워|감사해|여기까지|종료|마칠게|끝낼게|됐어)/.test(
    userText
  );

  return {
    hasCategory,
    hasParticipantCount,
    hasRegion,
    hasPurpose,
    hasContact,
    hasConsultingIntent,
    userWantsToEnd,
  };
}

const withServiceGuidance = (
  content: string,
  opts?: {
    noProgramFound?: boolean;
    savedConsulting?: boolean;
    context?: ChatContextSnapshot;
    contactProvided?: boolean;
  }
): string => {
  let next = content.trim();
  const context = opts?.context;

  if (opts?.noProgramFound) {
    if (!next.includes("추천 가능한 프로그램이 없습니다")) {
      next = `${next}\n\n현재 조건으로는 추천 가능한 프로그램이 없습니다.`;
    }
    if (!/상담|문의|연락/.test(next)) {
      next = `${next}\n\n${NO_PROGRAM_CTA}`;
    }
    if (!hasQuestionEnding(next)) {
      next = context?.hasContact
        ? `${next}\n\n남겨주신 연락처로 담당자가 이어서 도와드릴까요?`
        : `${next}\n\n조건 변경 없이 바로 상담 접수로 진행할까요? 연락받으실 휴대폰 또는 이메일을 알려주세요.`;
    }
    return next;
  }

  if (opts?.savedConsulting) {
    if (!opts.contactProvided) {
      next = `${next}\n\n빠른 진행을 위해 연락처(전화 또는 이메일)를 남겨주실 수 있을까요?`;
    }
    return next;
  }

  if (context?.userWantsToEnd) {
    if (!/언제든|필요하시면/.test(next)) {
      next = `${next}\n\n필요하실 때 같은 창에서 바로 다시 이어서 도와드리겠습니다.`;
    }
    return next;
  }

  if (!hasActionPrompt(next)) {
    next = `${next}\n\n${DEFAULT_SERVICE_CTA}`;
  }

  if (!hasQuestionEnding(next)) {
    if (!context?.hasCategory) {
      next = `${next}\n\n원하시는 프로그램 유형(예: 체험학습, 교사연수)부터 알려주실 수 있을까요?`;
    } else if (!context.hasParticipantCount) {
      next = `${next}\n\n예상 인원은 몇 명인지 알려주실 수 있을까요?`;
    } else if (!context.hasRegion) {
      next = `${next}\n\n희망 지역(국내/해외 포함)을 알려주시면 바로 맞춰보겠습니다.`;
    } else if (!context.hasPurpose) {
      next = `${next}\n\n이번 행사의 핵심 목적(진로/체험/연수 등)을 알려주실 수 있을까요?`;
    } else if (context.hasConsultingIntent && !context.hasContact) {
      next = `${next}\n\n상담 접수를 위해 연락받으실 휴대폰 또는 이메일을 남겨주실 수 있을까요?`;
    } else {
      next = `${next}\n\n추가로 꼭 반영해야 할 조건(일정, 안전, 식사, 이동수단)이 있을까요?`;
    }
  }

  return next;
};

// 카테고리 목록 문자열 생성 (줄바꿈 문자를 공백으로 변환)
const categoryList = PROGRAM_CATEGORIES.map((cat, idx) => {
  const name = cat.name.replace(/\n/g, " ");
  return `${idx + 1}. ${name}`;
}).join("\n");

const getSystemPrompt = (landingCategory?: string): string => {
  const categoryContext = landingCategory
    ? `\n**중요 맥락:** 사용자가 랜딩 페이지에서 "${landingCategory}"로 진입했습니다. 카테고리를 다시 강요하지 말고, 해당 맥락부터 자연스럽게 이어가세요.`
    : "";

  return (
    "당신은 '터치더월드'의 전문 교육 컨설턴트입니다. 친절하고 신뢰감 있는 말투로, 안전과 교육 목적을 중심으로 상담하세요.\n\n" +
    "**회사 정보:**\n" +
    "- 회사명: 주식회사 터치더월드 (Touch The World)\n" +
    "- 설립: 1996년\n" +
    "- 업종: 종합여행업, 유학 및 교육\n" +
    "- 대표 연락처: 1800-8078\n\n" +
    "**제공 카테고리(참고):**\n" +
    categoryList +
    categoryContext +
    "\n\n" +
    "**상담 운영 원칙:**\n" +
    "1. 템플릿을 기계적으로 따르지 말고, 사용자가 이미 준 정보(카테고리/인원/지역/연락처)를 우선 활용해 자연스럽게 이어가세요.\n" +
    "2. 이미 받은 정보를 반복 질문하지 마세요. 특히 카테고리, 연락처, 인원, 지역 재질문을 최소화하세요.\n" +
    "3. 사용자가 대화 종료 의사를 보이면 추가 질문을 강요하지 말고 간결히 마무리하세요.\n" +
    "4. 정보가 충분하면 searchPrograms를 호출해 실제 프로그램을 추천하세요.\n" +
    "5. searchPrograms 결과가 없으면 조건 변경을 강하게 요구하지 말고 상담 접수(연락처/희망 연락 시간)로 우선 유도하세요.\n" +
    "6. 사용자가 전화번호/이메일/담당자명을 남기면 반드시 인식해 확인하고, 상담 마무리 또는 견적 의사 표현 시 saveConsultingLog를 호출하세요. 비로그인 사용자도 연락처가 있으면 저장을 시도하세요.\n\n" +
    "**우선 수집할 핵심 정보:**\n" +
    "- 프로그램 유형(이미 주어졌다면 재질문 금지)\n" +
    "- 예상 인원\n" +
    "- 희망 지역\n" +
    "- 행사 목적/성격\n" +
    "- 인솔자 필요 여부\n" +
    "- 선호 이동수단\n" +
    "- 식사/안전/특별 요구사항\n\n" +
    "**응답 스타일:**\n" +
    "- 간결하고 명확하게 답변\n" +
    "- 매 턴에서 다음 행동을 1개 제안\n" +
    "- 필요한 경우에만 질문하고, 질문은 최대 1~2개로 제한\n" +
    "- 과도한 카테고리 나열/선택 강요 금지"
  );
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

const ANON_DAILY_CHAT_LIMIT = 5;
const USER_DAILY_CHAT_LIMIT = 120;

function getChatMeta(
  isAuthenticated: boolean,
  dailyLimit: number,
  dailyRemaining: number
) {
  return {
    isAuthenticated,
    historyEnabled: isAuthenticated,
    dailyLimit,
    dailyRemaining,
  };
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`chat:${clientIP}`, 30, 60 * 1000);
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
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

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
    const dailyLimit = isAuthenticated ? USER_DAILY_CHAT_LIMIT : ANON_DAILY_CHAT_LIMIT;
    const dailyRateLimitKey = isAuthenticated
      ? `chat:daily:user:${currentUser!.id}`
      : `chat:daily:anon:${clientIP}`;
    const dailyRateLimit = await checkRateLimit(
      dailyRateLimitKey,
      dailyLimit,
      24 * 60 * 60 * 1000
    );

    if (!dailyRateLimit.allowed) {
      return NextResponse.json(
        {
          error: isAuthenticated
            ? "오늘 AI 상담 사용 한도에 도달했습니다. 내일 다시 시도해주세요."
            : "비로그인 일일 상담 한도(5회)에 도달했습니다. 로그인하면 지금까지의 상담 맥락을 이어서 계속 진행할 수 있습니다.",
          requiresLogin: !isAuthenticated,
          ...(isAuthenticated
            ? {}
            : {
                loginNotice: LOGIN_HISTORY_NOTICE,
              }),
          retryAfter: Math.ceil((dailyRateLimit.resetTime - Date.now()) / 1000),
          meta: getChatMeta(isAuthenticated, dailyLimit, 0),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((dailyRateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 비로그인도 현재 세션 맥락을 유지할 수 있도록 최근 대화를 제한적으로 포함
    const effectiveMessages = isAuthenticated ? messages : messages.slice(-16);
    const chatContext = buildChatContext(effectiveMessages, landingCategory);
    const inferredContact = extractContactInfo(effectiveMessages);

    // OpenAI 메시지 형식으로 변환
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: getSystemPrompt(landingCategory),
      },
      ...effectiveMessages.map(toOpenAIMessage),
    ];

    // Function Calling 정의
    const searchProgramsFunction: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function = {
      name: "searchPrograms",
      description: "고객의 요구사항에 맞는 프로그램을 데이터베이스에서 검색합니다. 카테고리, 지역, 목적 등의 정보가 수집되면 호출하여 실제 프로그램을 추천하세요.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "프로그램 카테고리 (예: 체험학습, 수련활동, 국내외교육여행 등)",
          },
          region: {
            type: "string",
            description: "희망 지역 (예: 서울, 경기, 부산, 제주 등)",
          },
          participantCount: {
            type: "number",
            description: "예상 인원 (명)",
          },
          purpose: {
            type: "string",
            description: "여행 목적/성격 (예: 역사 탐방, 문화 체험, 자연 학습 등)",
          },
          duration: {
            type: "string",
            description: "희망 일정 (예: 3박 4일, 4박5일)",
          },
          estimatedBudget: {
            type: "number",
            description: "예상 예산 (원). 인원당 예산이면 participantCount와 함께 계산됩니다.",
          },
          limit: {
            type: "number",
            description: "검색 결과 개수 (기본값: 5, 최대: 10)",
          },
        },
        required: [],
      },
    };

    const saveConsultingLogFunction: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function = {
      name: "saveConsultingLog",
      description: "상담 내용을 저장하고 요약 이메일을 발송합니다. 사용자가 상담을 마무리하거나 견적 요청을 할 때 호출하세요.",
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
            description: "식사 취향/요구사항 (할랄, 채식, 알러지 등)",
          },
          specialRequests: {
            type: "string",
            description: "특별 요구사항 (알러지, 장애 지원, 특정 견학지 등)",
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
      searchProgramsFunction,
      saveConsultingLogFunction,
    ];

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      functions: functions,
      function_call: "auto",
      temperature: 0.5,
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

      if (functionName === "searchPrograms") {
        // 프로그램 검색
        const searchResult = await searchPrograms({
          category: typeof functionArgs.category === "string" ? functionArgs.category : undefined,
          region: typeof functionArgs.region === "string" ? functionArgs.region : undefined,
          participantCount: typeof functionArgs.participantCount === "number" ? functionArgs.participantCount : undefined,
          purpose: typeof functionArgs.purpose === "string" ? functionArgs.purpose : undefined,
          estimatedBudget: typeof functionArgs.estimatedBudget === "number" ? functionArgs.estimatedBudget : undefined,
          limit: typeof functionArgs.limit === "number" ? functionArgs.limit : 5,
        });

        if (searchResult.success && searchResult.programs && searchResult.programs.length > 0) {
          // 검색 결과를 포맷팅하여 응답
          const requestedCategory =
            typeof functionArgs.category === "string" ? functionArgs.category : undefined;
          const requestedRegion =
            typeof functionArgs.region === "string" ? functionArgs.region : undefined;
          const requestedDuration =
            typeof functionArgs.duration === "string" ? functionArgs.duration : undefined;
          const requestedParticipantCount =
            typeof functionArgs.participantCount === "number" ? functionArgs.participantCount : undefined;
          const requestedPurpose =
            typeof functionArgs.purpose === "string" ? functionArgs.purpose : undefined;

          const requestProfile = [
            requestedRegion,
            requestedDuration,
            requestedParticipantCount ? `${requestedParticipantCount}명` : undefined,
            requestedCategory || requestedPurpose,
          ]
            .filter(Boolean)
            .join(" / ");

          const programsText = searchResult.programs.map((p, idx) => {
            const priceInfo = p.priceFrom && p.priceTo 
              ? `인원당 ${(p.priceFrom / 10000).toFixed(0)}만원 ~ ${(p.priceTo / 10000).toFixed(0)}만원`
              : p.priceFrom 
              ? `인원당 ${(p.priceFrom / 10000).toFixed(0)}만원 이상`
              : "가격 문의";
            
            return `${idx + 1}. ${p.title}\n   - 지역: ${p.region || "미지정"}\n   - 가격: ${priceInfo}\n   - 평점: ${p.rating ? p.rating.toFixed(1) : "없음"} (후기 ${p.reviewCount}개)`;
          }).join("\n\n");

          return NextResponse.json({
            message: {
              role: "assistant",
              content: withServiceGuidance(
                `요청하신 조건${requestProfile ? `(${requestProfile})` : ""}을 기준으로 확인했을 때, 유사한 프로그램으로는 아래가 있습니다.\n\n${programsText}\n\n완전히 동일한 조건이 아니어도 상담을 통해 일정/인원/운영방식을 맞춘 맞춤형 프로그램으로 구성해드릴 수 있습니다. 원하시면 우선순위 1~2개를 기준으로 상세 일정과 견적 방향을 정리해드리겠습니다.`,
                { context: chatContext }
              ),
            },
            functionCall: {
              name: functionName,
              result: { count: searchResult.count, programs: searchResult.programs },
            },
            meta: getChatMeta(isAuthenticated, dailyLimit, dailyRateLimit.remaining),
          });
        } else {
          return NextResponse.json({
            message: {
              role: "assistant",
              content: withServiceGuidance(
                "요청하신 조건을 기준으로 검색했지만 일치하는 프로그램을 찾지 못했습니다.",
                { noProgramFound: true, context: chatContext }
              ),
            },
            functionCall: {
              name: functionName,
              result: { count: 0, programs: [] },
            },
            meta: getChatMeta(isAuthenticated, dailyLimit, dailyRateLimit.remaining),
          });
        }
      } else if (functionName === "saveConsultingLog") {
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

        // 이메일 발송
        if (saveResult.success) {
          await sendConsultingSummaryEmail({
            contactName,
            contactPhone,
            contactEmail,
            category: typeof functionArgs.category === "string" ? functionArgs.category : "미선택",
            participantCount: typeof functionArgs.participantCount === "number" ? functionArgs.participantCount : undefined,
            region: typeof functionArgs.region === "string" ? functionArgs.region : undefined,
            purpose: typeof functionArgs.purpose === "string" ? functionArgs.purpose : undefined,
            hasInstructor: typeof functionArgs.hasInstructor === "boolean" ? functionArgs.hasInstructor : undefined,
            preferredTransport: typeof functionArgs.preferredTransport === "string" ? functionArgs.preferredTransport : undefined,
            mealPreference: typeof functionArgs.mealPreference === "string" ? functionArgs.mealPreference : undefined,
            specialRequests: typeof functionArgs.specialRequests === "string" ? functionArgs.specialRequests : undefined,
            estimatedBudget: typeof functionArgs.estimatedBudget === "number" ? functionArgs.estimatedBudget : undefined,
            estimatedQuote: typeof functionArgs.estimatedQuote === "string" ? functionArgs.estimatedQuote : undefined,
            canQuoteImmediately: typeof functionArgs.canQuoteImmediately === "boolean" ? functionArgs.canQuoteImmediately : false,
          });
        }

        const saveConfirmationMessage = Boolean(contactPhone || contactEmail)
          ? typeof functionArgs.summary === "string"
            ? `상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다.\n\n${functionArgs.summary}`
            : "상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다."
          : typeof functionArgs.summary === "string"
            ? `상담 내용이 저장되었습니다.\n\n${functionArgs.summary}\n\n연락처가 확인되지 않아 담당자 배정이 보류되었습니다. 휴대폰 또는 이메일을 남겨주세요.`
            : "상담 내용이 저장되었습니다. 연락처가 확인되지 않아 담당자 배정이 보류되었습니다. 휴대폰 또는 이메일을 남겨주세요.";

        // Function 호출 후 응답 메시지 생성
        return NextResponse.json({
          message: {
            role: "assistant",
            content: withServiceGuidance(
              saveConfirmationMessage,
              {
                savedConsulting: true,
                context: chatContext,
                contactProvided: Boolean(contactPhone || contactEmail),
              }
            ),
          },
          functionCall: {
            name: functionName,
            result: saveResult,
          },
          meta: getChatMeta(isAuthenticated, dailyLimit, dailyRateLimit.remaining),
        });
      }
    }

    // 일반 응답
    return NextResponse.json({
      message: {
        role: "assistant",
        content: withServiceGuidance(
          assistantMessage.content || "죄송합니다. 응답을 생성할 수 없습니다.",
          { context: chatContext }
        ),
      },
      meta: getChatMeta(isAuthenticated, dailyLimit, dailyRateLimit.remaining),
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

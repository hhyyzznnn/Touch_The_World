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

// gpt-4o-mini는 여러 게시물의 내용을 한 프로그램처럼 섞어 답하는 일이 잦아, 근거 자료를
// 구분해서 따르는 능력이 더 나은 모델을 기본값으로 쓴다.
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

const DEFAULT_SERVICE_CTA =
  "원하시면 지금 바로 상담 접수를 도와드릴게요. 인원, 희망 지역, 이동수단(전세버스/KTX/항공) 중 가능한 항목부터 알려주세요.";

const hasActionPrompt = (text: string): boolean =>
  /(문의|접수|견적|연락|진행|재검색|조건|선택|알려주시면|말씀해주시면)/.test(text);

const hasQuestionEnding = (text: string): boolean =>
  text.includes("?") || /(까요|할까요|해주세요|주실 수 있을까요)\s*$/.test(text.trim());

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
  const hasParticipantCount = /\d{1,4}\s*명/.test(userText);
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

function wantsCategoryRedisplay(messages: ChatRequestMessage[]): boolean {
  const lastUserMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === "user")
    ?.content?.trim();

  if (!lastUserMessage) return false;
  if (/(필요없|괜찮|아니야|말고)/.test(lastUserMessage)) return false;

  return CATEGORY_REDISPLAY_REGEX.test(lastUserMessage);
}

const withServiceGuidance = (
  content: string,
  opts?: {
    savedConsulting?: boolean;
    context?: ChatContextSnapshot;
    contactProvided?: boolean;
  }
): string => {
  let next = content.trim();
  const context = opts?.context;

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

  // 단순 정보 질문("사전예약 언제까지예요?")에는 유도 문구를 덧붙이지 않는다.
  // 인원을 말했거나 견적·상담 의사를 보이는 등 실제 준비 신호가 있을 때만 다음 단계를 안내한다.
  if (!context?.hasConsultingIntent && !context?.hasParticipantCount) {
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
      next = `${next}\n\n추가로 꼭 반영해야 할 조건(일정, 안전, 이동수단, 알러지 유의사항)이 있을까요?`;
    }
  }

  return next;
};

// 카테고리 목록 문자열 생성 (줄바꿈 문자를 공백으로 변환)
const categoryList = PROGRAM_CATEGORIES.map((cat, idx) => {
  const name = cat.name.replace(/\n/g, " ");
  return `${idx + 1}. ${name}`;
}).join("\n");

const getSystemPrompt = (knowledgeBlock: string, landingCategory?: string): string => {
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
    "4. 조건에 맞는 프로그램을 추천할 때는 아래 참고 게시물 중에서 고르고, 맞는 것이 없으면 조건 변경을 강하게 요구하지 말고 상담 접수(연락처/희망 연락 시간)로 우선 유도하세요.\n" +
    "5. 사용자가 전화번호/이메일/담당자명을 남기면 반드시 인식해 확인하고, 상담 마무리 또는 견적 의사 표현 시 saveConsultingLog를 호출하세요. 비로그인 사용자도 연락처가 있으면 저장을 시도하세요.\n" +
    "6. 식사 항목은 기본 질문에서 과하게 묻지 마세요. 할랄/채식 여부는 사용자가 먼저 언급한 경우에만 확인하고, 기본은 알러지/건강상 유의사항만 간단히 확인하세요.\n\n" +
    "**우선 수집할 핵심 정보:**\n" +
    "- 프로그램 유형(이미 주어졌다면 재질문 금지)\n" +
    "- 예상 인원\n" +
    "- 희망 지역\n" +
    "- 희망 일정\n" +
    "- 행사 목적/성격\n" +
    "- 인솔자 필요 여부\n" +
    "- 선호 이동수단\n" +
    "- 안전/알러지(건강상 유의사항) 등 필수 운영 정보\n\n" +
    "**응답 스타일:**\n" +
    "- 간결하고 명확하게 답변\n" +
    "- 매 턴에서 다음 행동을 1개 제안\n" +
    "- 필요한 경우에만 질문하고, 질문은 최대 1~2개로 제한\n" +
    "- 과도한 카테고리 나열/선택 강요 금지\n" +
    "- 마크다운 문법(**굵게**, #제목, [텍스트](링크))을 쓰지 말고 일반 텍스트로 작성. 링크는 주소(https://...)를 그대로 한 줄에 적기\n\n" +
    "**답변 근거 규칙 (가장 중요):**\n" +
    `- 오늘 날짜는 ${new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })} 입니다.\n` +
    "- 터치더월드의 프로그램, 일정, 방문지, 지원사업, 제휴 혜택, 신청 조건·기간에 대한 내용은 반드시 아래 '참고 게시물' 본문에 적힌 사실만 사용해 답하세요.\n" +
    "- 본문에 적힌 항목만 전달하세요. 지원 대상, 가격, 날짜, 일정, 신청 방법, 연락처처럼 본문에 없는 항목을 형식을 맞추려고 만들어 넣지 마세요. 없는 내용을 물으면 '게시물에 안내되지 않은 내용'이라고 밝히고 담당자 확인(1800-8078) 또는 상담 접수로 안내하세요.\n" +
    "- 게시물마다 따로 구분해서 설명하고, 어느 게시물의 내용인지 제목을 밝히세요. 서로 다른 게시물의 일정·코스를 하나의 프로그램인 것처럼 섞지 마세요. 특정 학교의 진행 사례는 '진행 사례'라고 밝히세요.\n" +
    "- 게시물에 적힌 신청·지원·모집 기간이 오늘 날짜 기준으로 이미 지났다면(연도가 없으면 게시물 등록일의 연도로 해석) 답변 첫 문장에서 그 기간이 지났다는 점과 현재 가능 여부는 확인이 필요하다는 점을 먼저 알리세요.\n" +
    "- 게시물을 근거로 답했다면 답변 끝에 '자세히 보기'로 근거 게시물의 제목과 상세 페이지 주소를 반드시 적으세요(최대 2건).\n" +
    "- 본문이 제공되지 않고 '전체 게시물 제목 목록'에만 있는 글은 그런 안내가 있다는 사실까지만 말하고, 세부 내용은 지어내지 마세요.\n\n" +
    knowledgeBlock +
    "\n\n===== 답변 전 확인 =====\n" +
    "1. 위 참고 게시물 본문에 없는 사실은 답변에 쓰지 마세요.\n" +
    "2. 게시물에 적힌 기간·마감이 오늘 날짜보다 이전이면 첫 문장에서 '게시물 기준 기간이 지났다'고 먼저 알리세요.\n" +
    "3. 게시물을 근거로 답했다면 마지막에 '자세히 보기'와 상세 페이지 주소를 적으세요."
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
      /(수학여행|체험학습|교사연수|수련활동|교육여행|해외 취업 및 유학|지자체 및 대학 RISE 사업|특성화고교 프로그램)/g
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
    const chatContext = buildChatContext(effectiveMessages, landingCategory);
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
      temperature: 0.2,
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
            content: withServiceGuidance(
              saveConfirmationMessage,
              {
                savedConsulting: true,
                context: chatContext,
                contactProvided: Boolean(contactPhone || contactEmail),
              }
            ),
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
    const responseContent = withServiceGuidance(
      appendMissingSourceLinks(
        stripMarkdown(assistantMessage.content || "죄송합니다. 응답을 생성할 수 없습니다."),
        knowledge.sources
      ),
      { context: chatContext }
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

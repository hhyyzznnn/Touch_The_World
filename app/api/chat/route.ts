import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { saveConsultingLog, sendConsultingSummaryEmail, searchPrograms } from "@/lib/chat-actions";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { z } from "zod";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SERVICE_CTA =
  "원하시면 지금 바로 상담 접수를 도와드릴게요. 인원, 희망 지역, 이동수단(전세버스/KTX/항공) 중 가능한 항목부터 알려주세요.";

const NO_PROGRAM_CTA =
  "현재 조건으로는 추천 가능한 프로그램이 없습니다. 대신 조건을 조정해 재검색하거나, 맞춤 일정 문의로 전환해 드릴 수 있습니다. 원하시는 방향을 선택해주세요: 1) 조건 조정 후 재검색 2) 맞춤 일정 문의 접수";

const hasActionPrompt = (text: string): boolean =>
  /(문의|접수|견적|연락|진행|재검색|조건|선택|알려주시면|말씀해주시면)/.test(text);

const hasQuestionEnding = (text: string): boolean =>
  text.includes("?") || /(까요|할까요|해주세요|주실 수 있을까요)\s*$/.test(text.trim());

const withServiceGuidance = (
  content: string,
  opts?: {
    noProgramFound?: boolean;
    savedConsulting?: boolean;
  }
): string => {
  let next = content.trim();

  if (opts?.noProgramFound) {
    if (!next.includes("추천 가능한 프로그램이 없습니다")) {
      next = `${next}\n\n현재 조건으로는 추천 가능한 프로그램이 없습니다.`;
    }
    if (!next.includes("맞춤 일정 문의")) {
      next = `${next}\n\n${NO_PROGRAM_CTA}`;
    }
    if (!hasQuestionEnding(next)) {
      next = `${next}\n\n인원 또는 지역 조건을 먼저 조정해볼까요?`;
    }
    return next;
  }

  if (opts?.savedConsulting) {
    if (!/연락처|전화|이메일/.test(next)) {
      next = `${next}\n\n빠른 진행을 위해 연락처(전화 또는 이메일)를 남겨주실 수 있을까요?`;
    }
    return next;
  }

  if (!hasActionPrompt(next)) {
    next = `${next}\n\n${DEFAULT_SERVICE_CTA}`;
  }

  if (!hasQuestionEnding(next)) {
    next = `${next}\n\n우선 어떤 카테고리로 진행할지 알려주실 수 있을까요?`;
  }

  return next;
};

// 카테고리 목록 문자열 생성 (줄바꿈 문자를 공백으로 변환)
const categoryList = PROGRAM_CATEGORIES.map((cat, idx) => {
  const name = cat.name.replace(/\n/g, " ");
  return `${idx + 1}. ${name}`;
}).join("\n");

const getSystemPrompt = (landingCategory?: string): string => {
  let categoryContext = "";
  if (landingCategory) {
    categoryContext = "\n**중요:** 사용자가 랜딩 페이지에서 \"" + landingCategory + "\" 카테고리로 접근했습니다. 초기 대화에서 이 카테고리를 먼저 언급하고, 해당 카테고리에 맞춘 상담을 진행하세요.";
  }

  const prompt = "당신은 '터치더월드'의 전문 교육 컨설턴트입니다. 친절하고 신뢰감 있으며, 특히 '안전'과 '교육적 목적'을 강조하는 말투를 사용하세요.\n\n" +
    "**회사 정보:**\n" +
    "- 회사명: 주식회사 터치더월드 (Touch The World)\n" +
    "- 설립: 1996년 (28년 이상의 운영 경험)\n" +
    "- 업종: 종합여행업, 유학 및 교육\n" +
    "- 연락처: 1800-8078\n\n" +
    "**제공 프로그램 카테고리:**\n" +
    categoryList + categoryContext + "\n\n" +
    "**상담 프로세스:**\n" +
    "1. 사용자가 이미 카테고리를 선택했다면 바로 다음 단계로 진행하세요. 선택하지 않았다면 8개 카테고리 중 관심 분야를 선택하도록 유도하세요.\n" +
    "2. 카테고리 선택 후, 다음 핵심 정보를 자연스러운 대화로 수집하세요 (순서대로):\n" +
    "   - 예상 인원 (명)\n" +
    "   - 희망 지역\n" +
    "   - 여행 목적/성격\n" +
    "   - 인솔자 필요 여부 (필수)\n" +
    "   - 선호 이동수단 (전세버스/KTX/항공/기타) (필수)\n" +
    "   - 식사 취향/요구사항 (할랄, 채식, 알러지 등)\n" +
    "3. 정보 수집 중간에, 고객의 요구사항(카테고리, 지역, 목적 등)이 충분히 수집되면 searchPrograms 함수를 호출하여 데이터베이스에서 실제 프로그램을 검색하고 추천하세요. 검색된 프로그램이 있으면 구체적인 프로그램 제목, 지역, 가격 정보를 포함하여 추천하세요.\n" +
    "4. 추천 후에는 \"특별히 고려해야 할 사항(예: 알러지, 장애 학생 지원, 특정 견학지 포함 등)\"이 있는지 반드시 물어보세요.\n" +
    "5. 예상 예산이 있으면 물어보고, 즉시 견적 가능 여부를 판단하세요.\n" +
    "6. 사용자가 상담을 마무리하거나 '상세 견적 요청' 의사를 표시하면, saveConsultingLog 함수를 호출하여 정보를 저장하세요.\n\n" +
    "**핵심 운영 규칙:**\n" +
    "1. 질문에 답만 하고 끝내지 마세요. 모든 응답은 다음 행동을 제안하고, 추가 정보 1개 이상을 요청해야 합니다.\n" +
    "2. searchPrograms 결과가 없으면 반드시 '현재 조건으로는 추천 가능한 프로그램이 없다'고 명확히 말하세요.\n" +
    "3. 프로그램이 없을 때는 대화를 종료하지 말고, (a) 조건 조정 후 재검색 또는 (b) 맞춤 일정 문의 접수 중 하나로 유도하세요.\n" +
    "4. 일반 정보 질문(예: 비용, 일정)에도 서비스 흐름으로 연결하세요. 예: 카테고리/인원/지역 확인 -> 추천/문의.\n\n" +
    "**응답 스타일:**\n" +
    "- 친절하고 전문적인 톤 유지\n" +
    "- 안전과 교육적 가치 강조\n" +
    "- 간결하고 명확한 답변\n" +
    "- 사용자가 카테고리를 선택했다면 바로 해당 카테고리에 대한 상담을 시작하세요\n" +
    "- 마지막 문장은 반드시 다음 행동을 묻는 질문으로 마무리하세요";
  
  return prompt;
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

    // OpenAI 메시지 형식으로 변환
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: getSystemPrompt(landingCategory),
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Function Calling 정의
    const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] = [
      {
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
      },
      {
        name: "saveConsultingLog",
        description: "상담 내용을 저장하고 요약 이메일을 발송합니다. 사용자가 상담을 마무리하거나 견적 요청을 할 때 호출하세요.",
        parameters: {
          type: "object",
          properties: {
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
      },
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
                `요청하신 조건${requestProfile ? `(${requestProfile})` : ""}을 기준으로 확인했을 때, 유사한 프로그램으로는 아래가 있습니다.\n\n${programsText}\n\n완전히 동일한 조건이 아니어도 상담을 통해 일정/인원/운영방식을 맞춘 맞춤형 프로그램으로 구성해드릴 수 있습니다. 원하시면 우선순위 1~2개를 기준으로 상세 일정과 견적 방향을 정리해드리겠습니다.`
              ),
            },
            functionCall: {
              name: functionName,
              result: { count: searchResult.count, programs: searchResult.programs },
            },
          });
        } else {
          return NextResponse.json({
            message: {
              role: "assistant",
              content: withServiceGuidance(
                "요청하신 조건을 기준으로 검색했지만 일치하는 프로그램을 찾지 못했습니다.",
                { noProgramFound: true }
              ),
            },
            functionCall: {
              name: functionName,
              result: { count: 0, programs: [] },
            },
          });
        }
      } else if (functionName === "saveConsultingLog") {
        // 상담 로그 저장
        const saveResult = await saveConsultingLog({
          sessionId: sessionId || `session_${Date.now()}`,
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
          conversation: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date().toISOString(),
          })),
          summary: typeof functionArgs.summary === "string" ? functionArgs.summary : undefined,
        });

        // 이메일 발송
        if (saveResult.success) {
          await sendConsultingSummaryEmail({
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

        // Function 호출 후 응답 메시지 생성
        return NextResponse.json({
          message: {
            role: "assistant",
            content: withServiceGuidance(
              typeof functionArgs.summary === "string"
                ? `상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다.\n\n${functionArgs.summary}`
                : "상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다.",
              { savedConsulting: true }
            ),
          },
          functionCall: {
            name: functionName,
            result: saveResult,
          },
        });
      }
    }

    // 일반 응답
    return NextResponse.json({
      message: {
        role: "assistant",
        content: withServiceGuidance(
          assistantMessage.content || "죄송합니다. 응답을 생성할 수 없습니다."
        ),
      },
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

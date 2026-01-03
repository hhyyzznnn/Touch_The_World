import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { saveConsultingLog, sendConsultingSummaryEmail, searchPrograms } from "@/lib/chat-actions";
import { PROGRAM_CATEGORIES } from "@/lib/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    "**응답 스타일:**\n" +
    "- 친절하고 전문적인 톤 유지\n" +
    "- 안전과 교육적 가치 강조\n" +
    "- 간결하고 명확한 답변\n" +
    "- 사용자가 카테고리를 선택했다면 바로 해당 카테고리에 대한 상담을 시작하세요";
  
  return prompt;
};

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, landingCategory } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "메시지 배열이 필요합니다." },
        { status: 400 }
      );
    }

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
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message;

    // Function Calling 처리
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments || "{}");

      if (functionName === "searchPrograms") {
        // 프로그램 검색
        const searchResult = await searchPrograms({
          category: functionArgs.category,
          region: functionArgs.region,
          participantCount: functionArgs.participantCount,
          purpose: functionArgs.purpose,
          estimatedBudget: functionArgs.estimatedBudget,
          limit: functionArgs.limit || 5,
        });

        if (searchResult.success && searchResult.programs && searchResult.programs.length > 0) {
          // 검색 결과를 포맷팅하여 응답
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
              content: `고객님의 요구사항에 맞는 프로그램을 찾았습니다!\n\n${programsText}\n\n더 자세한 정보가 필요하시거나 다른 조건으로 검색을 원하시면 말씀해주세요.`,
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
              content: "죄송합니다. 요청하신 조건에 맞는 프로그램을 찾지 못했습니다. 다른 조건으로 검색해보시거나, 담당자에게 직접 문의해주시면 더 정확한 상담을 받으실 수 있습니다.",
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
          category: functionArgs.category,
          participantCount: functionArgs.participantCount,
          region: functionArgs.region,
          purpose: functionArgs.purpose,
          hasInstructor: functionArgs.hasInstructor,
          preferredTransport: functionArgs.preferredTransport,
          mealPreference: functionArgs.mealPreference,
          specialRequests: functionArgs.specialRequests,
          estimatedBudget: functionArgs.estimatedBudget,
          estimatedQuote: functionArgs.estimatedQuote,
          canQuoteImmediately: functionArgs.canQuoteImmediately || false,
          conversation: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date().toISOString(),
          })),
          summary: functionArgs.summary,
        });

        // 이메일 발송
        if (saveResult.success) {
          await sendConsultingSummaryEmail({
            category: functionArgs.category || "미선택",
            participantCount: functionArgs.participantCount,
            region: functionArgs.region,
            purpose: functionArgs.purpose,
            hasInstructor: functionArgs.hasInstructor,
            preferredTransport: functionArgs.preferredTransport,
            mealPreference: functionArgs.mealPreference,
            specialRequests: functionArgs.specialRequests,
            estimatedBudget: functionArgs.estimatedBudget,
            estimatedQuote: functionArgs.estimatedQuote,
            canQuoteImmediately: functionArgs.canQuoteImmediately || false,
          });
        }

        // Function 호출 후 응답 메시지 생성
        return NextResponse.json({
          message: {
            role: "assistant",
            content: functionArgs.summary
              ? `상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다.\n\n${functionArgs.summary}`
              : "상담 내용이 저장되었습니다. 담당자가 곧 연락드리겠습니다.",
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
        content: assistantMessage.content || "죄송합니다. 응답을 생성할 수 없습니다.",
      },
    });
  } catch (error: any) {
    console.error("Chat API 오류:", error);
    return NextResponse.json(
      {
        error: "채팅 처리 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

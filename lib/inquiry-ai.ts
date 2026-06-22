import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateInquirySummary(data: {
  schoolName: string;
  destination?: string | null;
  schoolLevel?: string | null;
  participantCount?: number | null;
  expectedDate?: string | null;
  purpose?: string | null;
  estimatedBudget?: number | null;
  hasInstructor?: boolean | null;
  preferredTransport?: string | null;
  accommodation?: string | null;
  message?: string | null;
  specialRequests?: string | null;
}): Promise<string | null> {
  if (!openai) return null;

  const fields = [
    data.destination && `목적지: ${data.destination}`,
    data.schoolLevel && `학교급: ${data.schoolLevel}`,
    data.participantCount && `인원: ${data.participantCount}명`,
    data.expectedDate && `일정: ${data.expectedDate}`,
    data.purpose && `목적: ${data.purpose}`,
    data.estimatedBudget && `예산: ${data.estimatedBudget.toLocaleString()}원`,
    data.hasInstructor != null && `인솔자: ${data.hasInstructor ? "필요" : "불필요"}`,
    data.preferredTransport && `이동수단: ${data.preferredTransport}`,
    data.accommodation && `숙박: ${data.accommodation}`,
    data.specialRequests && `특별요청: ${data.specialRequests}`,
    data.message && `문의내용: ${data.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!fields) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "교육여행 문의 데이터를 보고, 핵심 키워드를 ' · ' 구분자로 연결한 한 줄 요약을 만들어줘. " +
            "예시: '수학여행 · 50명 · 제주 · 2박3일 · 예산 300만원'. " +
            "없는 정보는 생략하고, 반드시 30자 이내로 작성해. 불필요한 설명 없이 키워드만.",
        },
        {
          role: "user",
          content: fields,
        },
      ],
      max_tokens: 80,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

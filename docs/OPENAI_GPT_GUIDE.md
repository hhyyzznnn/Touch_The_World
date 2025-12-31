# OpenAI GPT 사용 가이드

이 문서는 Touch The World 프로젝트에서 OpenAI GPT-4o-mini를 사용하는 방법을 설명합니다.

---

## 📋 목차

1. [기본 설정](#기본-설정)
2. [API 구조](#api-구조)
3. [System Prompt 작성](#system-prompt-작성)
4. [Function Calling](#function-calling)
5. [실제 구현 예시](#실제-구현-예시)
6. [에러 처리](#에러-처리)
7. [비용 최적화](#비용-최적화)

---

## 기본 설정

### 1. OpenAI API 키 발급

#### Step 1: OpenAI 계정 생성
1. [OpenAI 공식 웹사이트](https://platform.openai.com/) 접속
2. "Sign up" 또는 "Log in" 클릭
3. 이메일 또는 Google/Microsoft 계정으로 회원가입

#### Step 2: API 키 생성
1. 로그인 후 [API Keys 페이지](https://platform.openai.com/api-keys)로 이동
2. 우측 상단의 **"+ Create new secret key"** 버튼 클릭
3. 키 이름 입력 (예: "Touch The World Production")
4. **"Create secret key"** 클릭
5. **⚠️ 중요**: 생성된 API 키를 즉시 복사 (다시 볼 수 없음!)
   - 형식: `sk-proj-...` 또는 `sk-...`
   - 예시: `sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

#### Step 2-1: 첫 API 호출 테스트 (선택사항)
API 키 생성 후 "Make your first API call" 페이지가 표시됩니다:
- **API 키 확인**: 생성된 키가 자동으로 입력되어 있음
- **테스트 방법**: curl, Node.js, Python 중 선택 가능
- **테스트 실행**: 터미널에서 제공된 명령어 실행하여 API 동작 확인
- **참고**: 이 테스트는 선택사항이며, 프로젝트에서 바로 사용해도 됨

#### Step 3: 결제 정보 등록
1. [Billing 페이지](https://platform.openai.com/account/billing)로 이동
2. "Add payment method" 클릭
3. 신용카드 또는 결제 수단 등록
4. **참고**: 
   - 무료 크레딧이 제공될 수 있음 (신규 가입 시)
   - 사용량 기반 과금 (Pay-as-you-go)
   - 최소 충전 금액: $5 (일부 지역)

#### Step 4: 사용량 제한 확인
1. [Usage Limits 페이지](https://platform.openai.com/account/limits) 확인
2. Tier 1 (기본): 분당 3 requests, 일일 $0.50
3. 필요 시 Tier 업그레이드 요청

### 2. 패키지 설치

```bash
npm install openai
```

### 3. 환경 변수 설정

`.env` 파일에 OpenAI API 키 추가:

```env
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**⚠️ 보안 주의사항:**
- `.env` 파일은 절대 Git에 커밋하지 않기
- `.gitignore`에 `.env` 추가 확인
- 프로덕션 환경에서는 환경 변수로 관리

### 4. OpenAI 클라이언트 초기화

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

---

## API 구조

### 기본 Chat Completion API

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",           // 사용할 모델
  messages: [                      // 대화 메시지 배열
    { role: "system", content: "..." },
    { role: "user", content: "..." },
    { role: "assistant", content: "..." },
  ],
  temperature: 0.7,                // 창의성 (0.0 ~ 2.0)
  max_tokens: 1000,                // 최대 토큰 수
  functions: [...],                // Function Calling (선택)
  function_call: "auto",           // 함수 호출 모드
});
```

### 주요 파라미터

| 파라미터 | 설명 | 기본값 |
|---------|------|-------|
| `model` | 사용할 모델 (gpt-4o-mini, gpt-4, gpt-3.5-turbo 등) | 필수 |
| `messages` | 대화 메시지 배열 | 필수 |
| `temperature` | 응답의 창의성 (0.0=일관적, 2.0=창의적) | 1.0 |
| `max_tokens` | 최대 생성 토큰 수 | 무제한 |
| `functions` | Function Calling 함수 정의 배열 | 선택 |
| `function_call` | 함수 호출 모드 ("auto", "none", 또는 특정 함수) | "auto" |

---

## System Prompt 작성

### System Prompt란?

AI의 역할과 행동 방식을 정의하는 프롬프트입니다. 모든 대화의 맥락을 제공합니다.

### 작성 가이드

#### 1. 페르소나 정의

```typescript
const SYSTEM_PROMPT = `당신은 '터치더월드'의 전문 교육 컨설턴트입니다. 
친절하고 신뢰감 있으며, 특히 '안전'과 '교육적 목적'을 강조하는 말투를 사용하세요.`;
```

#### 2. 컨텍스트 정보 제공

```typescript
**회사 정보:**
- 회사명: 주식회사 터치더월드 (Touch The World)
- 설립: 1996년 (28년 이상의 운영 경험)
- 업종: 종합여행업, 유학 및 교육
- 연락처: 1800-8078
```

#### 3. 프로세스 정의

```typescript
**상담 프로세스:**
1. 먼저 8개 카테고리 중 관심 분야를 선택하도록 유도하세요.
2. 카테고리 선택 후, 다음 핵심 정보를 자연스러운 대화로 수집하세요:
   - 예상 인원 (명)
   - 희망 지역
   - 여행 목적/성격
   ...
```

#### 4. 응답 스타일 지정

```typescript
**응답 스타일:**
- 친절하고 전문적인 톤 유지
- 안전과 교육적 가치 강조
- 카테고리나 지역 선택 시 버튼 형태로 제안
- 간결하고 명확한 답변
```

### 동적 System Prompt

랜딩 페이지에서 특정 카테고리로 접근한 경우, 프롬프트를 동적으로 변경:

```typescript
const getSystemPrompt = (landingCategory?: string) => {
  const categoryContext = landingCategory 
    ? `\n**중요:** 사용자가 랜딩 페이지에서 "${landingCategory}" 카테고리로 접근했습니다. 
       초기 대화에서 이 카테고리를 먼저 언급하고, 해당 카테고리에 맞춘 상담을 진행하세요.`
    : "";

  return `당신은 '터치더월드'의 전문 교육 컨설턴트입니다...${categoryContext}`;
};
```

---

## Function Calling

### Function Calling이란?

GPT가 대화 중에 외부 함수를 호출할 수 있게 하는 기능입니다. 데이터베이스 저장, 이메일 발송 등에 사용합니다.

### 1. 함수 정의

```typescript
const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] = [
  {
    type: "function",
    function: {
      name: "saveConsultingLog",
      description: "사용자와의 상담 내용을 요약하여 데이터베이스에 저장합니다.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "상담 카테고리 (예: 수학여행, 체험학습)",
          },
          participantCount: {
            type: "number",
            description: "예상 인원 (명)",
          },
          region: {
            type: "string",
            description: "희망 여행 지역",
          },
          // ... 추가 필드
        },
        required: ["summary"],  // 필수 파라미터
      },
    },
  },
];
```

### 2. API 호출 시 함수 전달

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: openaiMessages,
  functions: functions,
  function_call: "auto",  // GPT가 자동으로 함수 호출 결정
  temperature: 0.7,
});
```

### 3. 함수 호출 처리

```typescript
const assistantMessage = completion.choices[0].message;

// Function Calling이 발생한 경우
if (assistantMessage.function_call) {
  const functionName = assistantMessage.function_call.name;
  const functionArgs = JSON.parse(assistantMessage.function_call.arguments || "{}");

  // 실제 함수 실행
  if (functionName === "saveConsultingLog") {
    const result = await saveConsultingLog(functionArgs);
    
    // GPT에게 함수 실행 결과 전달
    const functionResponse = {
      tool_call_id: assistantMessage.function_call.id,
      role: "tool",
      name: functionName,
      content: JSON.stringify(result),
    };

    // GPT가 함수 결과를 바탕으로 최종 응답 생성
    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...openaiMessages,
        assistantMessage,
        functionResponse,
      ],
    });

    return secondResponse.choices[0].message.content;
  }
}
```

### Function Calling 모드

| 모드 | 설명 |
|------|------|
| `"auto"` | GPT가 필요하다고 판단하면 함수 호출 (권장) |
| `"none"` | 함수 호출 안 함 |
| `{ name: "함수명" }` | 특정 함수만 강제 호출 |

---

## 실제 구현 예시

### 전체 흐름 (Next.js API Route)

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { saveConsultingLog, sendConsultingSummaryEmail } from "@/lib/chat-actions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System Prompt 정의
const SYSTEM_PROMPT = `당신은 '터치더월드'의 전문 교육 컨설턴트입니다...`;

// Function 정의
const functions = [
  {
    type: "function",
    function: {
      name: "saveConsultingLog",
      description: "상담 내용을 DB에 저장합니다.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          participantCount: { type: "number" },
          // ...
        },
        required: ["summary"],
      },
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, landingCategory } = await request.json();

    // 메시지 배열 구성
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: getSystemPrompt(landingCategory) },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // GPT API 호출
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

      // 함수 실행
      if (functionName === "saveConsultingLog") {
        const saveResult = await saveConsultingLog({
          sessionId: sessionId || `session_${Date.now()}`,
          ...functionArgs,
          conversation: messages,
        });

        // 이메일 발송
        if (saveResult.success) {
          await sendConsultingSummaryEmail(functionArgs);
        }

        // GPT에게 함수 결과 전달하고 최종 응답 생성
        const functionResponse = {
          tool_call_id: assistantMessage.function_call.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(saveResult),
        };

        const secondResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            ...openaiMessages,
            assistantMessage,
            functionResponse,
          ],
        });

        return NextResponse.json({
          message: {
            role: "assistant",
            content: secondResponse.choices[0].message.content,
          },
        });
      }
    }

    // 일반 응답
    return NextResponse.json({
      message: {
        role: "assistant",
        content: assistantMessage.content,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### 클라이언트에서 사용

```typescript
// components/ChatWidget.tsx
const handleSend = async () => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      sessionId: sessionId,
      landingCategory: landingCategory,
    }),
  });

  const data = await response.json();
  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content: data.message.content,
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, assistantMessage]);
};
```

---

## 에러 처리

### 1. API 키 누락

```typescript
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}
```

### 2. API 호출 실패

```typescript
try {
  const completion = await openai.chat.completions.create({...});
} catch (error: any) {
  if (error.status === 401) {
    // 인증 실패 (API 키 오류)
    console.error("OpenAI API 인증 실패");
  } else if (error.status === 429) {
    // Rate Limit 초과
    console.error("API 호출 한도 초과");
  } else {
    console.error("OpenAI API 오류:", error);
  }
}
```

### 3. Function Calling 파싱 오류

```typescript
try {
  const functionArgs = JSON.parse(assistantMessage.function_call.arguments || "{}");
} catch (error) {
  console.error("Function arguments 파싱 실패:", error);
  // 기본값 사용 또는 재시도
}
```

---

## 비용 최적화

### 1. 모델 선택

| 모델 | 비용 (입력/출력 1K 토큰) | 용도 |
|------|------------------------|------|
| `gpt-4o-mini` | $0.15 / $0.60 | 일반 대화, 상담 (권장) |
| `gpt-4` | $30 / $60 | 복잡한 추론 필요 시 |
| `gpt-3.5-turbo` | $0.5 / $1.5 | 간단한 작업 |

**현재 프로젝트**: `gpt-4o-mini` 사용 (비용 효율적이면서도 충분한 성능)

### 2. 토큰 수 제한

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: openaiMessages,
  max_tokens: 500,  // 최대 토큰 수 제한
});
```

### 3. 대화 기록 관리

오래된 메시지는 제거하거나 요약:

```typescript
// 최근 10개 메시지만 전송
const recentMessages = messages.slice(-10);
```

### 4. System Prompt 최적화

- 불필요한 정보 제거
- 간결하고 명확한 지시사항 작성
- 반복되는 내용은 한 번만 작성

---

## 모델별 특징

### gpt-4o-mini (현재 사용)

- **장점**: 비용 효율적, 빠른 응답 속도, 충분한 성능
- **단점**: 복잡한 추론 능력은 gpt-4보다 낮음
- **용도**: 일반 상담, 간단한 질의응답, 데이터 수집

### gpt-4

- **장점**: 높은 추론 능력, 복잡한 작업 처리
- **단점**: 비용이 높음, 응답 속도 느림
- **용도**: 복잡한 분석, 창의적 작업

---

## 주의사항

1. **API 키 보안**: 
   - 절대 클라이언트에 노출하지 않기 (서버 사이드에서만 사용)
   - `.env` 파일을 Git에 커밋하지 않기
   - 키가 노출되면 즉시 삭제하고 재생성
2. **Rate Limit**: OpenAI API는 분당/일당 호출 제한이 있음
   - 기본 Tier: 분당 3 requests
   - 필요 시 Tier 업그레이드 요청
3. **비용 모니터링**: 
   - [Usage Dashboard](https://platform.openai.com/usage)에서 실시간 확인
   - 비용 알림 설정 권장
   - gpt-4o-mini 사용 시 비용 효율적 (입력 $0.15/1K 토큰, 출력 $0.60/1K 토큰)
4. **프롬프트 주입 공격**: 사용자 입력을 그대로 System Prompt에 넣지 않기
5. **에러 처리**: 네트워크 오류, API 오류, Rate Limit 등 모든 경우 처리
6. **결제 정보**: 
   - 사용량 기반 과금 (Pay-as-you-go)
   - 최소 충전 금액 확인 필요
   - 예상치 못한 비용 방지를 위해 사용량 제한 설정 권장

---

## API 키 관리 팁

### 1. 키 보안
- **절대 공개하지 않기**: GitHub, 코드 리뷰, 채팅 등에 노출 금지
- **환경 변수 사용**: 하드코딩 금지
- **키 로테이션**: 정기적으로 새 키 생성 후 교체

### 2. 키별 용도 분리
- **개발용 키**: 로컬 개발 환경
- **스테이징용 키**: 테스트 서버
- **프로덕션용 키**: 실제 서비스

### 3. 사용량 모니터링
- [Usage Dashboard](https://platform.openai.com/usage)에서 실시간 사용량 확인
- 비용 알림 설정 (예: $50 도달 시 알림)
- 일일/월별 사용량 추적

### 4. 키 삭제/재생성
- 키가 노출된 경우 즉시 삭제
- [API Keys 페이지](https://platform.openai.com/api-keys)에서 삭제 가능
- 새 키 생성 후 `.env` 파일 업데이트

## 참고 자료

- [OpenAI 공식 문서](https://platform.openai.com/docs)
- [API Keys 관리](https://platform.openai.com/api-keys)
- [Function Calling 가이드](https://platform.openai.com/docs/guides/function-calling)
- [프롬프트 엔지니어링 가이드](https://platform.openai.com/docs/guides/prompt-engineering)
- [가격 정보](https://openai.com/api/pricing/)
- [사용량 대시보드](https://platform.openai.com/usage)

---

## 현재 프로젝트 구조

```
app/api/chat/route.ts          # GPT API 호출 엔드포인트
lib/chat-actions.ts            # Function Calling 함수들
components/ChatWidget.tsx      # 클라이언트 채팅 UI
components/HeroChatInput.tsx   # 히어로 섹션 채팅 입력
```

---

**작성일**: 2025-01-XX  
**작성자**: AI Assistant  
**프로젝트**: Touch The World


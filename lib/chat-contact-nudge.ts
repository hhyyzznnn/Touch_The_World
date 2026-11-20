/**
 * AI 상담에서 연락처를 받지 못하고 끝나는 상담을 줄이기 위한 규칙 (2026-11-20).
 *
 * 2026-11-20 상담: 선생님이 학년·인원·날짜까지 알려 주셨는데 상담 AI가 일정만 계속 짜 드리고
 * 연락처를 한 번도 묻지 않아, 담당자가 다시 연락할 방법 없이 대화가 끝났다.
 * 지침에 "한 번 요청하라"가 있어도 모델이 놓칠 수 있어, 조건이 맞으면 답변 끝에 코드로 한 번 붙인다.
 */

export const CONTACT_NUDGE =
  "견적과 일정표를 정리해 보내 드릴 수 있도록 성함과 연락처(전화 또는 이메일)를 남겨 주시면 담당자가 바로 연락드리겠습니다. 바로 통화를 원하시면 1800-8078로 전화 주세요.";

const ASKS_CONTACT = /(연락처|전화번호|이메일|메일 주소|성함)/;

type Msg = { role: string; content: string };

export function shouldAskForContact(params: {
  messages: Msg[];
  assistantContent: string;
  hasContact: boolean;
  leadSignals: number;
}): boolean {
  if (params.hasContact) return false;
  // 인원·지역·일정·목적 중 두 가지 이상을 들었을 때만 — 처음 인사나 가벼운 질문에는 붙이지 않는다
  if (params.leadSignals < 2) return false;
  if (ASKS_CONTACT.test(params.assistantContent)) return false;
  // 이미 한 번 물었으면 매번 반복하지 않는다
  const askedBefore = params.messages.some((m) => m.role === "assistant" && ASKS_CONTACT.test(m.content));
  return !askedBefore;
}

export function withContactNudge(content: string, ask: boolean): string {
  return ask ? `${content.trimEnd()}\n\n${CONTACT_NUDGE}` : content;
}

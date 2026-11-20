import assert from "node:assert/strict";
import test from "node:test";
import { CONTACT_NUDGE, shouldAskForContact, withContactNudge } from "@/lib/chat-contact-nudge";

// 2026-11-20 실제 상담 흐름(개인 정보 제외): 학년·인원·날짜를 말했는데 상담 AI가 일정만 짜고 연락처를 묻지 않았다.
const conversation = [
  { role: "assistant", content: "안녕하세요! 어떤 프로그램에 관심이 있으신가요?" },
  { role: "user", content: "국내 교육여행" },
  { role: "assistant", content: "국내 교육여행으로 안내드리겠습니다. 학년, 인원, 희망 일정을 알려 주세요." },
  { role: "user", content: "초등학교 5학년, 30명, 1.20-1.22" },
];
const draft = "초등 5학년 30명 기준 2박 3일 예시 초안입니다. 1일차: 개항장 → 해양박물관 ...";

test("인원·일정을 들었고 연락처가 없으면 답변 끝에 연락처 요청을 붙인다", () => {
  const ask = shouldAskForContact({ messages: conversation, assistantContent: draft, hasContact: false, leadSignals: 2 });
  assert.equal(ask, true);
  assert.ok(withContactNudge(draft, ask).endsWith(CONTACT_NUDGE));
});

test("연락처가 이미 있거나, 이번 답변·이전 답변에서 이미 물었으면 붙이지 않는다", () => {
  assert.equal(shouldAskForContact({ messages: conversation, assistantContent: draft, hasContact: true, leadSignals: 3 }), false);
  assert.equal(
    shouldAskForContact({ messages: conversation, assistantContent: `${draft} 연락처를 남겨 주세요.`, hasContact: false, leadSignals: 3 }),
    false
  );
  const asked = [...conversation, { role: "assistant", content: `초안입니다.\n\n${CONTACT_NUDGE}` }, { role: "user", content: "다시 짜 주세요" }];
  assert.equal(shouldAskForContact({ messages: asked, assistantContent: draft, hasContact: false, leadSignals: 3 }), false);
});

test("처음 인사나 정보가 하나뿐일 때는 붙이지 않는다", () => {
  assert.equal(
    shouldAskForContact({ messages: conversation.slice(0, 2), assistantContent: "국내 교육여행 안내입니다.", hasContact: false, leadSignals: 1 }),
    false
  );
});

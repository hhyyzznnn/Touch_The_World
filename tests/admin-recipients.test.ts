import assert from "node:assert/strict";
import test from "node:test";
import { getAdminRecipients } from "@/lib/email";

// 문의 폼 알림과 AI 상담 리드 알림이 같은 수신자에게 가야 한다(2026-11-18, AI 리드가 추가 수신자에게 안 가던 문제).
test("ADMIN_EMAIL과 ADMIN_CC_EMAILS를 모두 받는 사람으로 쓴다", () => {
  const prev = { a: process.env.ADMIN_EMAIL, c: process.env.ADMIN_CC_EMAILS };
  process.env.ADMIN_EMAIL = "office@example.com";
  process.env.ADMIN_CC_EMAILS = " staff@example.com, ,office@example.com ";
  try {
    assert.deepEqual(getAdminRecipients(), ["office@example.com", "staff@example.com"]);
  } finally {
    process.env.ADMIN_EMAIL = prev.a;
    process.env.ADMIN_CC_EMAILS = prev.c;
    if (prev.a === undefined) delete process.env.ADMIN_EMAIL;
    if (prev.c === undefined) delete process.env.ADMIN_CC_EMAILS;
  }
});

test("추가 수신자가 없으면 기본 관리자 한 명", () => {
  const prev = { a: process.env.ADMIN_EMAIL, c: process.env.ADMIN_CC_EMAILS };
  process.env.ADMIN_EMAIL = "office@example.com";
  delete process.env.ADMIN_CC_EMAILS;
  try {
    assert.deepEqual(getAdminRecipients(), ["office@example.com"]);
  } finally {
    process.env.ADMIN_EMAIL = prev.a;
    if (prev.a === undefined) delete process.env.ADMIN_EMAIL;
    if (prev.c !== undefined) process.env.ADMIN_CC_EMAILS = prev.c;
  }
});

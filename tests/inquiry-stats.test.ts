import assert from "node:assert/strict";
import test from "node:test";
import { buildInquiryStats, landingLabel, monthlyCounts, type InquiryStatRow } from "@/lib/inquiry-stats";

const row = (createdAt: string, extra: Partial<InquiryStatRow> = {}): InquiryStatRow => ({
  createdAt: new Date(createdAt),
  sourceType: "manual",
  status: "pending",
  linkedEventId: null,
  purpose: null,
  schoolLevel: null,
  destination: null,
  attribution: null,
  ...extra,
});

test("월별 집계는 한국 시간 기준이고 문의 없는 달도 0으로 채운다", () => {
  const now = new Date("2026-10-15T00:00:00+09:00");
  const months = monthlyCounts(
    [row("2026-09-30T16:00:00Z"), row("2026-08-10T00:00:00Z", { sourceType: "ai_consulting" })],
    3,
    now,
  );
  // 9/30 16:00 UTC = 10/1 01:00 KST → 10월
  assert.deepEqual(months, [
    { month: "2026-08", form: 0, chatbot: 1 },
    { month: "2026-09", form: 0, chatbot: 0 },
    { month: "2026-10", form: 1, chatbot: 0 },
  ]);
});

test("유입 경로는 기록이 있는 문의만 채널로 나눈다", () => {
  const at = "2026-10-01T00:00:00Z";
  const stats = buildInquiryStats([
    row(at, { attribution: { first: { landing: "/news/a?utm_source=youtube", at, utmSource: "youtube" } } }),
    row(at, { attribution: { first: { landing: "/", at, referrer: "google.com" }, last: { landing: "/inquiry", at, referrer: "naver.com" } } }),
    row(at, { linkedEventId: "e1" }),
  ]);
  assert.equal(stats.total, 3);
  assert.equal(stats.tracked, 2);
  assert.deepEqual(stats.firstChannel.map((c) => c.label).sort(), ["구글 검색", "유튜브"]);
  assert.deepEqual(stats.lastChannel.map((c) => c.label).sort(), ["네이버 검색", "유튜브"]);
  assert.equal(stats.progressed, 1);
});

test("랜딩 경로 표시는 쿼리를 버리고 메인은 이름으로", () => {
  assert.equal(landingLabel("/?utm_source=x"), "메인");
  assert.equal(landingLabel("/news/abc?utm_campaign=abc"), "/news/abc");
});

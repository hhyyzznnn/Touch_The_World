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
    { month: "2026-08", form: 0, chatbot: 1, direct: 0 },
    { month: "2026-09", form: 0, chatbot: 0, direct: 0 },
    { month: "2026-10", form: 1, chatbot: 0, direct: 0 },
  ]);
});

test("관리자가 기록한 전화·카톡 문의는 홈페이지 폼과 따로 센다", () => {
  const now = new Date("2026-11-27T00:00:00+09:00");
  const rows = [
    row("2026-11-20T00:00:00Z", { sourceType: "phone" }),
    row("2026-11-21T00:00:00Z", { sourceType: "kakao" }),
    row("2026-11-22T00:00:00Z", { sourceType: "callback" }),
  ];
  assert.deepEqual(monthlyCounts(rows, 1, now), [{ month: "2026-11", form: 1, chatbot: 0, direct: 2 }]);
  const labels = buildInquiryStats(rows, now).source.map((s) => s.label).sort();
  assert.deepEqual(labels, ["전화", "전화 요청(홈페이지)", "카카오톡"].sort());
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

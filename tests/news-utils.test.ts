import assert from "node:assert/strict";
import test from "node:test";
import { formatEndDate, isEnded, parseEndDate } from "@/lib/news-utils";

test("마감일은 그날의 끝(한국 시간)으로 저장되고 같은 날짜로 다시 표시된다", () => {
  const end = parseEndDate("2026-10-16");
  assert.ok(end);
  assert.equal(end.toISOString(), "2026-10-16T14:59:59.000Z");
  assert.equal(formatEndDate(end), "2026-10-16");
});

test("형식이 틀리거나 비어 있는 마감일은 null", () => {
  for (const value of ["", "2026/10/16", "10-16", "2026-13-40", null, undefined, 20261016]) {
    assert.equal(parseEndDate(value), null);
  }
});

test("마감일이 없으면 종료가 아니고, 마감 당일까지는 진행 중이다", () => {
  const todayKst = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  assert.equal(isEnded(null), false);
  assert.equal(isEnded(undefined), false);
  assert.equal(isEnded(parseEndDate(todayKst)), false);
  assert.equal(isEnded(parseEndDate("2020-01-01")), true);
});

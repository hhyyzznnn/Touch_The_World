import assert from "node:assert/strict";
import test from "node:test";
import { isTripEvent, planTrips, urgency } from "@/lib/outreach";

test("교육여행성 행사만 고르고 개인 결석·사전 안내는 뺀다", () => {
  assert.equal(isTripEvent("2학년 수학여행"), true);
  assert.equal(isTripEvent("1학년 현장 체험학습"), true);
  assert.equal(isTripEvent("수련활동(1학년)"), true);
  assert.equal(isTripEvent("교외체험학습 신청서 제출"), false);
  assert.equal(isTripEvent("수학여행 사전교육"), false);
  assert.equal(isTripEvent("중간고사"), false);
});

test("여러 날 이어진 행사는 첫날로 묶고, 오늘 기준 다음 연락 시기를 계산한다", () => {
  const today = new Date("2026-01-10T00:00:00+09:00");
  const plans = planTrips(
    [
      { date: "20250512", name: "2학년 수학여행" },
      { date: "20250513", name: "2학년 수학여행" },
      { date: "20250514", name: "2학년 수학여행" },
      { date: "20250304", name: "개학식" },
    ],
    today,
  );
  assert.equal(plans.length, 1);
  assert.equal(plans[0].lastDate, "2025-05-12");
  assert.equal(plans[0].expectedDate, "2026-05-12");
  assert.equal(plans[0].contactFrom, "2026-01-12");
  assert.equal(plans[0].status, "soon");
});

test("연락 시기 안이면 now, 시기는 지났지만 행사 전이면 late, 행사가 지났으면 다음 해", () => {
  const now = planTrips([{ date: "20251020", name: "1학년 체험학습" }], new Date("2026-07-01T00:00:00+09:00"));
  assert.equal(now[0].expectedDate, "2026-10-20");
  assert.equal(now[0].status, "now");
  const late = planTrips([{ date: "20250410", name: "체험학습" }], new Date("2026-03-01T00:00:00+09:00"));
  assert.equal(late[0].expectedDate, "2026-04-10");
  assert.equal(late[0].status, "late");
  const next = planTrips([{ date: "20250410", name: "체험학습" }], new Date("2026-05-01T00:00:00+09:00"));
  assert.equal(next[0].expectedDate, "2027-04-10");
  assert.equal(next[0].status, "later");
  assert.equal(urgency(next), 2);
  assert.equal(urgency([]), 99);
});

test("이름이 조금 달라도 예상일이 3주 안이면 같은 행사로 합치고 최근 이름을 남긴다", () => {
  const plans = planTrips(
    [
      { date: "20250707", name: "교과별체험학습활동" },
      { date: "20260706", name: "교과 체험학습의 날" },
      { date: "20260514", name: "학급 체험학습의 날" },
    ],
    new Date("2026-10-23T00:00:00+09:00"),
  );
  assert.deepEqual(plans.map((p) => p.name), ["학급 체험학습의 날", "교과 체험학습의 날"]);
});

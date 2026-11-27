import assert from "node:assert/strict";
import test from "node:test";
import { buildCostTable, classifyDestination, costLines, manwon, parseNights, parsePerPerson } from "@/lib/trip-cost";

test("1인당 금액은 여러 표기를 읽고, 총액·말이 안 되는 값은 버린다", () => {
  assert.equal(parsePerPerson("약 733,079원"), 733079);
  assert.equal(parsePerPerson("723,000원 정도"), 723000);
  assert.equal(parsePerPerson("약 ￦313,000원"), 313000);
  assert.equal(parsePerPerson("약 금654,700원"), 654700);
  assert.equal(parsePerPerson("약 79,340,000원/총인원"), null);
  assert.equal(parsePerPerson("약 6,311원"), null);
  assert.equal(parsePerPerson(null), null);
});

test("기간은 'N박' 표기가 없으면 날짜 범위로 계산한다", () => {
  assert.equal(parseNights("2027. 4. 7.(수) ~ 4. 9.(금) 2박 3일"), 2);
  assert.equal(parseNights("2027.03.31.(수) ~ 2027.04.01.(목) 1박2"), 1);
  assert.equal(parseNights("2027. 5. 26.(수) ~ 2027. 5. 28.(금)"), 2);
  assert.equal(parseNights("2027.3.29.(월) ~ 2027.4.1.(목)"), 3);
  assert.equal(parseNights("2026년 12월 17일(목) 1~6교시"), null);
  assert.equal(parseNights(""), null);
});

test("목적지는 제목·장소로 나눈다", () => {
  assert.equal(classifyDestination("2027학년도 서인천고 2학년 제주도 수학여행"), "제주");
  assert.equal(classifyDestination("해동고 국외(일본오사카)수학여행"), "일본");
  assert.equal(classifyDestination("포항고 국제교류 미국 학교 방문"), "해외");
  assert.equal(classifyDestination("광동고 1학년 수련활동"), "수련활동");
  assert.equal(classifyDestination("주제별 현장체험학습 경주"), "국내");
});

test("표본 5건 이상인 칸만 범위를 내고, 목적지 전체 범위도 함께 만든다", () => {
  const jeju = (per: number, period = "2박 3일") => ({ title: "제주 수학여행", aiSummary: { "1인당": `약 ${per.toLocaleString()}원`, 기간: period } });
  const rows = [600000, 700000, 750000, 800000, 900000].map((p) => jeju(p));
  rows.push(jeju(1000000, "3박 4일"));
  const t = buildCostTable(rows);
  assert.deepEqual(t.byLength.제주?.[2], { low: 700000, mid: 750000, high: 800000, count: 5 });
  assert.equal(t.byLength.제주?.[3], undefined);
  assert.equal(t.overall.제주?.count, 6);
  assert.equal(t.overall.일본, undefined);
  assert.equal(manwon(733079), "73만");
});

test("AI 상담·가이드용 요약 줄은 목적지 전체 범위와 기간별 범위를 함께 담는다", () => {
  const jeju = (per: number) => ({ title: "제주 수학여행", aiSummary: { "1인당": `약 ${per.toLocaleString()}원`, 기간: "2박 3일" } });
  const lines = costLines(buildCostTable([600000, 700000, 750000, 800000, 900000].map(jeju)));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^제주: 1인당 약 70만~80만 원, 중간값 75만 원\(공고 5건\) · 기간별 2박 3일 70만~80만 원\(공고 5건\)$/);
});

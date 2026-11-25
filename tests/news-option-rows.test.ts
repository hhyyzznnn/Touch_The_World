import assert from "node:assert/strict";
import test from "node:test";
import { isOptionRow, optionLabel, rowCells, tableHasOptions, type HastLike } from "@/lib/news-option-rows";

const td = (t: string): HastLike => ({ type: "element", tagName: "td", children: [{ type: "text", value: t }] });
const th = (t: string): HastLike => ({ type: "element", tagName: "th", children: [{ type: "text", value: t }] });
const tr = (...cells: HastLike[]): HastLike => ({ type: "element", tagName: "tr", children: cells });
const table = (...rows: HastLike[]): HastLike => ({ type: "element", tagName: "table", children: [{ type: "element", tagName: "tbody", children: rows }] });

test("오사카 일정표처럼 번호로 시작하는 줄은 선택지로 보고 첫 칸을 이름으로 쓴다", () => {
  const cells = rowCells(tr(td("01. 팬스타 왕복 2박 3일 — 바닷길로 떠나는 압축 체험형"), td("선내 2박 · 현지 당일 탐방"), td("오사카 핵심 문화탐방")));
  assert.equal(isOptionRow(cells), true);
  assert.equal(optionLabel(cells), "01. 팬스타 왕복 2박 3일 — 바닷길로 떠나는 압축 체험형");
});

test("번호 칸이 따로 있으면 둘째 칸까지 붙인다", () => {
  const cells = rowCells(tr(td("01"), td("현장체험학습"), td("1일 · 1박 2일")));
  assert.equal(optionLabel(cells), "01 현장체험학습");
});

test("'항목 | 내용' 설명 표와 머리줄은 선택지가 아니다", () => {
  assert.equal(isOptionRow(rowCells(tr(td("참가비"), td("1인당 300,000원")))), false);
  assert.equal(isOptionRow(rowCells(tr(th("구성"), th("숙박")))), false);
  assert.equal(isOptionRow(rowCells(tr(td("2026년 3월"), td("공고")))), false);
  assert.equal(tableHasOptions(table(tr(td("대상"), td("초·중·고")), tr(td("일정"), td("평일")))), false);
  assert.equal(tableHasOptions(table(tr(td("01"), td("A")), tr(td("02"), td("B")))), true);
});

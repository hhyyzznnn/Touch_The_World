import assert from "node:assert/strict";
import test from "node:test";
import { currentSeasonKeys, isSeasonKey, normalizeSeasons } from "@/lib/news-seasons";

test("정해진 시기만 남기고 학사 일정 순서로 정리한다", () => {
  assert.deepEqual(normalizeSeasons(["겨울방학", "1학기", "봄", "겨울방학"]), ["1학기", "겨울방학"]);
  assert.deepEqual(normalizeSeasons("수능이후, 2학기"), ["2학기", "수능이후"]);
  assert.deepEqual(normalizeSeasons(undefined), []);
});

test("주소의 시기 값은 정해진 다섯 가지만 받는다", () => {
  assert.equal(isSeasonKey("수능이후"), true);
  assert.equal(isSeasonKey("수능 이후"), false);
  assert.equal(isSeasonKey("연중"), false);
});

test("한국 시간 기준으로 지금 시기를 고른다", () => {
  assert.deepEqual(currentSeasonKeys(new Date("2026-11-10T03:00:00Z")), ["2학기", "수능이후"]);
  assert.deepEqual(currentSeasonKeys(new Date("2026-07-15T03:00:00Z")), ["1학기", "여름방학"]);
  // 한국 시간 1월 1일 새벽 = UTC 12월 31일
  assert.deepEqual(currentSeasonKeys(new Date("2026-12-31T16:00:00Z")), ["겨울방학"]);
});

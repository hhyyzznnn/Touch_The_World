import assert from "node:assert/strict";
import test from "node:test";
import {
  parsePositivePageParam,
  resetSearchPaginationParams,
} from "@/lib/search-params";

test("검색 페이지 파라미터는 1 미만/NaN이면 1로 보정한다", () => {
  assert.equal(parsePositivePageParam(undefined), 1);
  assert.equal(parsePositivePageParam("0"), 1);
  assert.equal(parsePositivePageParam("-5"), 1);
  assert.equal(parsePositivePageParam("abc"), 1);
  assert.equal(parsePositivePageParam("3"), 3);
});

test("검색 페이징 리셋은 page/programPage/eventPage/schoolPage/achievementPage를 제거한다", () => {
  const params = new URLSearchParams(
    "q=제주&category=teacher-training&page=4&programPage=2&eventPage=3&schoolPage=5&achievementPage=6"
  );

  resetSearchPaginationParams(params);

  assert.equal(params.get("q"), "제주");
  assert.equal(params.get("category"), "teacher-training");
  assert.equal(params.get("page"), null);
  assert.equal(params.get("programPage"), null);
  assert.equal(params.get("eventPage"), null);
  assert.equal(params.get("schoolPage"), null);
  assert.equal(params.get("achievementPage"), null);
});

import assert from "node:assert/strict";
import test from "node:test";
import { buildFavoriteStatusMap, parseFavoriteProgramIds } from "@/lib/favorites";

test("즐겨찾기 배치 파라미터는 공백/중복을 제거한다", () => {
  const ids = parseFavoriteProgramIds(" a , b, a, , c ,,");
  assert.deepEqual(ids, ["a", "b", "c"]);
});

test("즐겨찾기 상태 맵은 요청된 프로그램만 키로 만들고 좋아요 여부를 채운다", () => {
  const status = buildFavoriteStatusMap(
    ["p1", "p2", "p3"],
    ["p2", "p999"]
  );

  assert.deepEqual(status, {
    p1: false,
    p2: true,
    p3: false,
  });
});

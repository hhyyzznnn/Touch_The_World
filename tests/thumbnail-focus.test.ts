import assert from "node:assert/strict";
import test from "node:test";
import {
  buildThumbnailUrlWithFocus,
  clampFocusPercent,
  parseThumbnailFocus,
} from "@/lib/thumbnail-focus";

test("썸네일 포커스 URL을 생성하고 다시 파싱할 수 있다", () => {
  const rawUrl = "https://cdn.example.com/sample.jpg";
  const focused = buildThumbnailUrlWithFocus(rawUrl, 23, 77);
  const parsed = parseThumbnailFocus(focused);

  assert.equal(parsed.imageUrl, rawUrl);
  assert.equal(parsed.focusX, 23);
  assert.equal(parsed.focusY, 77);
});

test("기존 해시 파라미터가 있어도 ttw-focus를 병합한다", () => {
  const rawUrl = "https://cdn.example.com/sample.jpg#v=1";
  const focused = buildThumbnailUrlWithFocus(rawUrl, 12, 34);
  const parsed = parseThumbnailFocus(focused);

  assert.equal(parsed.imageUrl, rawUrl);
  assert.equal(parsed.focusX, 12);
  assert.equal(parsed.focusY, 34);
});

test("포커스 값은 0~100 범위로 보정된다", () => {
  assert.equal(clampFocusPercent(-20), 0);
  assert.equal(clampFocusPercent(500), 100);
  assert.equal(clampFocusPercent(Number.NaN), 50);
});

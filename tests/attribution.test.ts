import assert from "node:assert/strict";
import test from "node:test";
import { buildTouch, classifyTouch, mergeTouch, sanitizeAttribution } from "@/lib/attribution";

const SITE = "www.touchtheworld.co.kr";
const at = new Date("2026-10-15T00:00:00Z");

test("사이트 안에서 이동한 페이지는 유입으로 기록하지 않는다", () => {
  assert.equal(buildTouch({ pathname: "/programs", search: "" }, "https://www.touchtheworld.co.kr/", SITE, at), null);
});

test("UTM이 붙은 유튜브 링크는 유튜브로 분류된다", () => {
  const touch = buildTouch(
    { pathname: "/news/a", search: "?utm_source=youtube&utm_medium=shorts&utm_campaign=a" },
    "",
    SITE,
    at,
  );
  assert.ok(touch);
  assert.equal(touch.utmCampaign, "a");
  assert.equal(classifyTouch(touch), "유튜브");
});

test("검색엔진·카카오·직접 방문을 구분한다", () => {
  const of = (referrer: string) => classifyTouch(buildTouch({ pathname: "/", search: "" }, referrer, SITE, at) ?? undefined);
  assert.equal(of("https://www.google.com/"), "구글 검색");
  assert.equal(of("https://m.search.naver.com/search.naver?query=x"), "네이버 검색");
  assert.equal(of("http://pf.kakao.com/_xoxixkPn"), "카카오");
  assert.equal(of("https://chatgpt.com/"), "AI 어시스턴트");
  assert.equal(of(""), "직접 방문");
  assert.equal(classifyTouch(undefined), "알 수 없음");
});

test("클라이언트가 보낸 값은 알려진 필드만 남기고 잘못된 값은 버린다", () => {
  assert.equal(sanitizeAttribution("x"), null);
  assert.equal(sanitizeAttribution({ first: { landing: "/", at: "not-a-date" } }), null);
  const cleaned = sanitizeAttribution({
    first: { landing: "/", at: at.toISOString(), referrer: "google.com", evil: "<script>" },
  });
  assert.deepEqual(cleaned, { first: { landing: "/", at: at.toISOString(), referrer: "google.com", utmSource: undefined, utmMedium: undefined, utmCampaign: undefined } });
});

test("출처 없는 재진입은 30분 안이면 마지막 경로를 덮어쓰지 않는다", () => {
  const youtube = buildTouch({ pathname: "/news/a", search: "?utm_source=youtube" }, "", SITE, at)!;
  const saved = mergeTouch(null, youtube)!;
  const soon = buildTouch({ pathname: "/inquiry", search: "" }, "", SITE, new Date(at.getTime() + 5 * 60 * 1000))!;
  assert.equal(mergeTouch(saved, soon), null);
  const later = buildTouch({ pathname: "/", search: "" }, "", SITE, new Date(at.getTime() + 2 * 60 * 60 * 1000))!;
  const merged = mergeTouch(saved, later)!;
  assert.equal(merged.first?.utmSource, "youtube");
  assert.equal(classifyTouch(merged.last), "직접 방문");
});

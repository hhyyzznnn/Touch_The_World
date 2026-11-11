import assert from "node:assert/strict";
import test from "node:test";
import { pickRelated, recommendFromHistory, type RecItem } from "@/lib/news-related";

const item = (id: string, over: Partial<RecItem> = {}): RecItem => ({
  id,
  categories: [],
  hashtags: [],
  audiences: [],
  seasons: [],
  endDate: null,
  createdAt: "2026-10-01T00:00:00Z",
  ...over,
});

const incheonTeacher1 = item("incheon-teacher-1", { categories: ["교직원 연수·혜택"], hashtags: ["#인천", "#교직원"], audiences: ["교직원"] });
const incheonTeacher2 = item("incheon-teacher-2", { categories: ["교직원 연수·혜택"], hashtags: ["#인천", "#교직원"], audiences: ["교직원"] });
const inspire = item("inspire-teacher", { categories: ["교직원 연수·혜택"], hashtags: ["#인천", "#교직원"], audiences: ["교직원"], createdAt: "2026-11-10T00:00:00Z" });
const seoulTeacher = item("seoul-teacher", { categories: ["교직원 연수·혜택"], hashtags: ["#서울", "#교직원"], audiences: ["교직원"] });
const japanTrip = item("japan-trip", { categories: ["일본 교육여행"], hashtags: ["#일본", "#고등"], audiences: ["고등"] });
const endedIncheon = item("ended-incheon", { categories: ["교직원 연수·혜택"], hashtags: ["#인천", "#교직원"], audiences: ["교직원"], endDate: "2026-01-31T14:59:59Z" });
const all = [incheonTeacher1, incheonTeacher2, inspire, seoulTeacher, japanTrip, endedIncheon];

test("하단 추천은 분야·지역·대상이 많이 겹치는 순, 마감·자기 자신·무관한 글은 뺀다", () => {
  const related = pickRelated(incheonTeacher1, all).map((r) => r.id);
  assert.deepEqual(related.slice(0, 2), ["inspire-teacher", "incheon-teacher-2"]);
  assert.ok(related.includes("seoul-teacher"));
  assert.ok(!related.includes("japan-trip"));
  assert.ok(!related.includes("ended-incheon"));
  assert.ok(!related.includes("incheon-teacher-1"));
});

test("인천 교직원 연수 글을 2개 보면 아직 안 본 인스파이어 교직원 연수를 추천한다", () => {
  const rec = recommendFromHistory([incheonTeacher1, incheonTeacher2], all);
  assert.equal(rec?.item.id, "inspire-teacher");
  assert.equal(rec?.reason, "인천 · 교직원 연수·혜택");
});

test("글 1개만 봤거나 관심이 겹치지 않으면 추천하지 않는다", () => {
  assert.equal(recommendFromHistory([incheonTeacher1], all), null);
  assert.equal(recommendFromHistory([incheonTeacher1, japanTrip], all), null);
});

test("이미 본 글과 마감된 글은 추천하지 않는다", () => {
  const rec = recommendFromHistory([incheonTeacher1, incheonTeacher2, inspire], all);
  assert.equal(rec?.item.id, "seoul-teacher");
});

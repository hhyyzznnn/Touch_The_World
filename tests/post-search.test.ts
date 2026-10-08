import assert from "node:assert/strict";
import test from "node:test";
import { rankPosts } from "@/lib/post-search";

const post = (title: string, extra: Partial<{ summary: string | null; hashtags: string[]; categories: string[] }> = {}) => ({
  title,
  summary: null,
  hashtags: [],
  categories: [],
  ...extra,
});

test("제목 일치 > 태그 일치 > 요약 일치 > 본문만 일치 순으로 정렬한다", () => {
  const posts = [
    post("선생님 업무 지원 가이드"),
    post("교육여행 안내", { summary: "포천 코스 포함" }),
    post("당일 체험학습", { hashtags: ["#포천"] }),
    post("2026 포천 버스지원금"),
  ];
  assert.deepEqual(
    rankPosts(posts, ["포천"]).map((p) => p.title),
    ["2026 포천 버스지원금", "당일 체험학습", "교육여행 안내", "선생님 업무 지원 가이드"]
  );
});

test("점수가 같으면 입력 순서(최신순)를 유지한다", () => {
  const posts = [post("인천 A"), post("인천 B"), post("인천 C")];
  assert.deepEqual(rankPosts(posts, ["인천"]).map((p) => p.title), ["인천 A", "인천 B", "인천 C"]);
});

test("제목이 같은 중복 게시물은 한 번만 남긴다", () => {
  const posts = [post("하나투어 제우스"), post("다른 글"), post("하나투어 제우스")];
  assert.equal(rankPosts(posts, ["하나투어"]).length, 2);
});

test("여러 단어는 각각 점수에 더해진다", () => {
  const posts = [post("인천 교육여행"), post("인천 체험학습")];
  assert.equal(rankPosts(posts, ["인천", "체험학습"])[0].title, "인천 체험학습");
});

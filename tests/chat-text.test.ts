import assert from "node:assert/strict";
import test from "node:test";
import { appendMissingSourceLinks, stripMarkdown } from "@/lib/chat-text";

test("stripMarkdown은 굵게·제목·링크 문법을 일반 텍스트로 바꾼다", () => {
  assert.equal(stripMarkdown("**대상**: 교직원"), "대상: 교직원");
  assert.equal(stripMarkdown("## 안내\n본문"), "안내\n본문");
  assert.equal(
    stripMarkdown("[자세히 보기](https://www.touchtheworld.co.kr/news/a)"),
    "자세히 보기\nhttps://www.touchtheworld.co.kr/news/a"
  );
});

const sources = [
  { title: "2026 포천 버스지원금 교육여행 — 8월까지 전액 지원", url: "https://x.kr/news/pocheon" },
  { title: "하나투어 교직원 혜택", url: "https://x.kr/news/hanatour" },
];

test("제목을 언급했는데 링크가 빠진 게시물만 주소를 붙인다", () => {
  const result = appendMissingSourceLinks("2026 포천 버스지원금 교육여행 프로그램은 종료되었습니다.", sources);
  assert.match(result, /자세히 보기\n2026 포천 버스지원금[^\n]*\nhttps:\/\/x\.kr\/news\/pocheon$/);
  assert.doesNotMatch(result, /hanatour/);
});

test("이미 링크가 있거나 언급하지 않은 게시물은 건드리지 않는다", () => {
  const withLink = "하나투어 교직원 혜택 안내입니다.\nhttps://x.kr/news/hanatour";
  assert.equal(appendMissingSourceLinks(withLink, sources), withLink);
  assert.equal(appendMissingSourceLinks("안녕하세요.", sources), "안녕하세요.");
});

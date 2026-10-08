import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKnowledgeIndex,
  findRelevantDocs,
  formatKnowledgeBlock,
  toGrams,
  type KnowledgeRow,
} from "@/lib/chat-knowledge-index";

const DAY = 86_400_000;
const row = (overrides: Partial<KnowledgeRow> & Pick<KnowledgeRow, "id" | "title">): KnowledgeRow => ({
  summary: "",
  content: "",
  categories: [],
  hashtags: [],
  link: null,
  createdAt: new Date("2026-06-01T00:00:00Z"),
  endDate: null,
  ...overrides,
});

const rows: KnowledgeRow[] = [
  row({
    id: "teacher-guide",
    title: "학교 선생님 업무 지원 가이드",
    content: "인천관광공사·포천시 등 지자체 지원사업 안내",
    createdAt: new Date("2026-10-07T00:00:00Z"),
  }),
  row({
    id: "pocheon-bus",
    title: "2026 포천 버스지원금 교육여행 — 8월까지 전액 지원",
    summary: "포천시 공식 버스지원프로그램",
    content: "버스 전액지원 — 8월 말까지 실제 행사 진행 기준",
    hashtags: ["#포천", "#학생"],
    endDate: new Date(Date.now() - 30 * DAY),
  }),
  row({
    id: "hanatour",
    title: "2026 교직원·가족을 위한 하나투어 전용 여행 혜택",
    content: "패키지 여행상품 3% 할인, 호텔 예약 3% 할인",
    link: "https://ttw.hanatour.com",
  }),
  row({
    id: "kywa",
    title: "2027 학교단체 수련활동 2차 사전예약",
    content: "집중 모집기간 10.16까지",
    categories: ["수련활동"],
    endDate: new Date(Date.now() + 5 * DAY),
  }),
  row({ id: "dup-newer", title: "같은 제목 게시물", content: "카드뉴스 버전" }),
  row({ id: "dup-older", title: "같은 제목 게시물", content: "회사 소식 버전" }),
];

test("toGrams는 한글·영문 연속 구간을 2글자 조각으로 나눈다", () => {
  assert.deepEqual([...toGrams("버스비 지원 A1")], ["버스", "스비", "지원", "a1"]);
  assert.equal(toGrams("a 가").size, 0);
});

test("인덱스는 같은 제목의 중복 게시물을 먼저 나온 1건만 남긴다", () => {
  const index = buildKnowledgeIndex(rows);
  assert.equal(index.docs.filter((doc) => doc.title === "같은 제목 게시물").length, 1);
  assert.equal(index.docs.find((doc) => doc.title === "같은 제목 게시물")?.id, "dup-newer");
});

test("제목에 검색어가 있는 게시물이 본문에만 스친 게시물보다 먼저 나온다", () => {
  const index = buildKnowledgeIndex(rows);
  const docs = findRelevantDocs(index, ["포천 버스비 지원 사업이 뭐예요?"]);
  assert.equal(docs[0]?.id, "pocheon-bus");
});

test("관련 게시물이 없으면 빈 목록을 돌려준다", () => {
  const index = buildKnowledgeIndex(rows);
  assert.deepEqual(findRelevantDocs(index, ["zzz qqq"]), []);
});

test("후속 질문은 직전 메시지의 맥락으로 게시물을 찾는다", () => {
  const index = buildKnowledgeIndex(rows);
  const docs = findRelevantDocs(index, ["하나투어 교직원 혜택 알려주세요", "거기 할인은 몇 퍼센트?"]);
  assert.equal(docs[0]?.id, "hanatour");
});

test("근거 블록에는 상세 주소·외부 링크·마감 상태가 들어간다", () => {
  const index = buildKnowledgeIndex(rows);
  const byId = (id: string) => index.docs.filter((doc) => doc.id === id);

  const ended = formatKnowledgeBlock(index, byId("pocheon-bus"), "https://example.kr");
  assert.match(ended, /상세 페이지: https:\/\/example\.kr\/news\/pocheon-bus/);
  assert.match(ended, /이미 종료됨/);

  const ongoing = formatKnowledgeBlock(index, byId("kywa"), "https://example.kr");
  assert.match(ongoing, /현재 진행 중/);

  const withLink = formatKnowledgeBlock(index, byId("hanatour"), "https://example.kr");
  assert.match(withLink, /관련 외부 링크: https:\/\/ttw\.hanatour\.com/);
  assert.doesNotMatch(withLink, /마감일/);
});

test("근거 블록은 관련 게시물이 없어도 전체 제목 목록은 제공한다", () => {
  const index = buildKnowledgeIndex(rows);
  const block = formatKnowledgeBlock(index, [], "https://example.kr");
  assert.match(block, /관련 게시물을 찾지 못했습니다/);
  assert.match(block, /- 2027 학교단체 수련활동 2차 사전예약/);
});

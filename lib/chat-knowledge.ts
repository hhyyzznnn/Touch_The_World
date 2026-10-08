import { prisma } from "./prisma";
import { getSiteUrl } from "./site-url";
import { formatEndDate, isEnded } from "./news-utils";

/**
 * 챗봇 답변의 근거 자료 — 홈페이지에 올라간 게시물(CompanyNews 전체)을 매 질문마다 검색해
 * 관련 본문을 시스템 프롬프트에 넣는다. 모델이 "검색 함수를 부를지" 스스로 판단하게 두면
 * 정보성 질문에서는 거의 조회하지 않고 내용을 지어내므로, 조회는 항상 서버가 먼저 한다.
 */

interface KnowledgeDoc {
  id: string;
  title: string;
  summary: string;
  content: string;
  categories: string[];
  hashtags: string[];
  link: string | null;
  createdAt: Date;
  endDate: Date | null;
  fields: { grams: Set<string>; weight: number }[];
}

interface KnowledgeIndex {
  docs: KnowledgeDoc[];
  idf: Map<string, number>;
  loadedAt: number;
}

// 새 게시물이 올라오면 늦어도 이 시간 안에 챗봇 답변에 반영된다.
const INDEX_TTL_MS = 5 * 60 * 1000;
const MAX_SOURCES = 4;
const MAX_CONTENT_CHARS = 1800;
const MIN_RELATIVE_SCORE = 0.35;

let cachedIndex: KnowledgeIndex | null = null;
let pendingLoad: Promise<KnowledgeIndex> | null = null;

/** 형태소 분석기 없이 한국어를 매칭하기 위해 글자 2-gram을 쓴다 ("버스비 지원" → 버스, 스비, 지원). */
function toGrams(text: string): Set<string> {
  const grams = new Set<string>();
  const runs = text.toLowerCase().match(/[가-힣a-z0-9]+/g) ?? [];
  for (const run of runs) {
    if (run.length === 1) continue;
    for (let i = 0; i < run.length - 1; i++) grams.add(run.slice(i, i + 2));
  }
  return grams;
}

async function loadIndex(): Promise<KnowledgeIndex> {
  const rows = await prisma.companyNews.findMany({
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      categories: true,
      hashtags: true,
      link: true,
      createdAt: true,
      endDate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 같은 제목으로 두 유형(회사소식·카드뉴스)에 중복 등록된 글은 최신 1건만 쓴다.
  const seenTitles = new Set<string>();
  const docs: KnowledgeDoc[] = [];
  for (const row of rows) {
    if (seenTitles.has(row.title)) continue;
    seenTitles.add(row.title);
    const summary = row.summary ?? "";
    const content = row.content ?? "";
    docs.push({
      ...row,
      summary,
      content,
      fields: [
        { grams: toGrams(row.title), weight: 3 },
        { grams: toGrams([...row.categories, ...row.hashtags].join(" ")), weight: 2 },
        { grams: toGrams(summary), weight: 2 },
        { grams: toGrams(content), weight: 1 },
      ],
    });
  }

  const docFrequency = new Map<string, number>();
  for (const doc of docs) {
    const all = new Set<string>();
    for (const field of doc.fields) field.grams.forEach((g) => all.add(g));
    all.forEach((g) => docFrequency.set(g, (docFrequency.get(g) ?? 0) + 1));
  }
  // "교육", "여행"처럼 거의 모든 글에 나오는 조각은 점수에 거의 기여하지 않게 한다.
  const idf = new Map<string, number>();
  docFrequency.forEach((df, gram) => idf.set(gram, Math.log(1 + docs.length / df)));

  return { docs, idf, loadedAt: Date.now() };
}

async function getIndex(): Promise<KnowledgeIndex> {
  if (cachedIndex && Date.now() - cachedIndex.loadedAt < INDEX_TTL_MS) return cachedIndex;
  if (!pendingLoad) {
    pendingLoad = loadIndex()
      .then((index) => {
        cachedIndex = index;
        return index;
      })
      .finally(() => {
        pendingLoad = null;
      });
  }
  try {
    return await pendingLoad;
  } catch (error) {
    // DB가 잠깐 안 될 때는 직전 인덱스로라도 답한다.
    if (cachedIndex) return cachedIndex;
    throw error;
  }
}

function scoreDoc(doc: KnowledgeDoc, queryGrams: Map<string, number>, idf: Map<string, number>): number {
  let score = 0;
  queryGrams.forEach((queryWeight, gram) => {
    const gramIdf = idf.get(gram);
    if (!gramIdf) return;
    let best = 0;
    for (const field of doc.fields) {
      if (field.weight > best && field.grams.has(gram)) best = field.weight;
    }
    score += best * gramIdf * queryWeight;
  });
  return score;
}

export interface ChatKnowledge {
  /** 시스템 프롬프트에 그대로 붙이는 근거 자료 블록 */
  promptBlock: string;
  sources: { title: string; url: string }[];
}

/**
 * @param userMessages 사용자가 보낸 메시지(오래된 순). 마지막 질문을 가장 크게 반영하고,
 *   "거기 일정은요?" 같은 후속 질문을 위해 직전 메시지들도 낮은 비중으로 함께 본다.
 */
export async function buildChatKnowledge(
  userMessages: string[],
  landingCategory?: string
): Promise<ChatKnowledge> {
  const index = await getIndex();

  const queryGrams = new Map<string, number>();
  const addQuery = (text: string, weight: number) => {
    toGrams(text).forEach((gram) => {
      queryGrams.set(gram, Math.max(queryGrams.get(gram) ?? 0, weight));
    });
  };
  const recent = userMessages.slice(-4);
  recent.forEach((text, i) => {
    const distanceFromLatest = recent.length - 1 - i;
    addQuery(text, distanceFromLatest === 0 ? 1 : 0.4);
  });
  if (landingCategory) addQuery(landingCategory, 0.4);

  const ranked = index.docs
    .map((doc) => ({ doc, score: scoreDoc(doc, queryGrams, index.idf) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.doc.createdAt.getTime() - a.doc.createdAt.getTime());

  const topScore = ranked[0]?.score ?? 0;
  const sources = ranked
    .filter((entry) => entry.score >= topScore * MIN_RELATIVE_SCORE)
    .slice(0, MAX_SOURCES)
    .map((entry) => entry.doc);

  const siteUrl = getSiteUrl();
  const now = Date.now();
  const today = new Date(now).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const sourceBlocks = sources.map((doc, i) => {
    const body =
      doc.content.length > MAX_CONTENT_CHARS
        ? `${doc.content.slice(0, MAX_CONTENT_CHARS)}…(이하 생략)`
        : doc.content;
    return [
      `[게시물 ${i + 1}] ${doc.title}`,
      // 모델이 "8월 말까지" 같은 기간이 이미 지났는지 판단할 수 있도록 경과 일수를 같이 준다.
      `등록일: ${doc.createdAt.toISOString().slice(0, 10)} (오늘 ${today} 기준 ${Math.floor((now - doc.createdAt.getTime()) / 86_400_000)}일 전 게시) / 분류: ${doc.categories.join(", ") || "회사 소식"}`,
      `상세 페이지: ${siteUrl}/news/${doc.id}`,
      ...(doc.link ? [`관련 외부 링크: ${doc.link}`] : []),
      ...(doc.endDate
        ? [
            `신청·운영 마감일: ${formatEndDate(doc.endDate)} → ${
              isEnded(doc.endDate) ? "이미 종료됨 (답변 첫 문장에서 종료 사실을 알릴 것)" : "현재 진행 중"
            }`,
          ]
        : []),
      `요약: ${doc.summary}`,
      `본문:\n${body}`,
    ].join("\n");
  });

  const titleList = index.docs.map((doc) => `- ${doc.title}`).join("\n");

  const promptBlock = [
    "===== 참고 게시물 (이번 질문과 관련도가 높은 홈페이지 게시물 본문) =====",
    sourceBlocks.length > 0 ? sourceBlocks.join("\n\n---\n\n") : "(관련 게시물을 찾지 못했습니다)",
    "",
    "===== 전체 게시물 제목 목록 (최신순, 제목만) =====",
    titleList,
  ].join("\n");

  return {
    promptBlock,
    sources: sources.map((doc) => ({ title: doc.title, url: `${siteUrl}/news/${doc.id}` })),
  };
}

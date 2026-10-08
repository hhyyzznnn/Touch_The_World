import { prisma } from "./prisma";
import { getSiteUrl } from "./site-url";
import {
  buildKnowledgeIndex,
  findRelevantDocs,
  formatKnowledgeBlock,
  type KnowledgeIndex,
} from "./chat-knowledge-index";

/**
 * 챗봇 답변의 근거 자료 — 홈페이지에 올라간 게시물(CompanyNews 전체)을 매 질문마다 검색해
 * 관련 본문을 시스템 프롬프트에 넣는다. 모델이 "검색 함수를 부를지" 스스로 판단하게 두면
 * 정보성 질문에서는 거의 조회하지 않고 내용을 지어내므로, 조회는 항상 서버가 먼저 한다.
 * (검색·정렬 로직 자체는 chat-knowledge-index.ts)
 */

// 새 게시물이 올라오면 늦어도 이 시간 안에 챗봇 답변에 반영된다.
const INDEX_TTL_MS = 5 * 60 * 1000;

let cachedIndex: KnowledgeIndex | null = null;
let pendingLoad: Promise<KnowledgeIndex> | null = null;

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
  return buildKnowledgeIndex(rows);
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

export interface ChatKnowledge {
  /** 시스템 프롬프트에 그대로 붙이는 근거 자료 블록 */
  promptBlock: string;
  sources: { title: string; url: string }[];
}

export async function buildChatKnowledge(
  userMessages: string[],
  landingCategory?: string
): Promise<ChatKnowledge> {
  const index = await getIndex();
  const sources = findRelevantDocs(index, userMessages, landingCategory);
  const siteUrl = getSiteUrl();

  return {
    promptBlock: formatKnowledgeBlock(index, sources, siteUrl),
    sources: sources.map((doc) => ({ title: doc.title, url: `${siteUrl}/news/${doc.id}` })),
  };
}

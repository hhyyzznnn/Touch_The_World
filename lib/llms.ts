/**
 * llms.txt / llms-full.txt — ChatGPT·Perplexity·Gemini 같은 AI 검색이 회사를 정확히 소개하도록 주는 요약 문서 (2026-11-26).
 * 예전엔 public/llms.txt를 손으로 써서 유튜브 주소·최소 인원(20명 ↔ FAQ 5명)이 사이트와 어긋나 있었다.
 * 이제 회사 정보(COMPANY_INFO)·FAQ·카드뉴스 DB에서 만들어, 사이트를 고치면 함께 바뀐다.
 */
import { CompanyNewsType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMPANY_INFO, FOUNDED_YEAR, YEARS_OF_EXPERIENCE } from "@/lib/constants";
import { PROGRAM_CATEGORIES } from "@/lib/news-constants";
import { FAQS } from "@/lib/faq-data";
import { isEnded, stripBrandFromTitle } from "@/lib/news-utils";
import { getSiteUrl } from "@/lib/site-url";

type Program = {
  id: string;
  title: string;
  summary: string | null;
  categories: string[];
  hashtags: string[];
  link: string | null;
  endDate: Date | null;
  createdAt: Date;
};

async function loadPrograms(): Promise<Program[]> {
  const rows = await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.PROGRAM_CARD_NEWS },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, summary: true, categories: true, hashtags: true, link: true, endDate: true, createdAt: true },
  });
  return rows.filter((r) => !isEnded(r.endDate));
}

const oneLine = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

function header(site: string): string {
  const c = COMPANY_INFO;
  return [
    `# ${c.englishName} (터치더월드)`,
    "",
    `> ${FOUNDED_YEAR}년부터 ${YEARS_OF_EXPERIENCE}년간 초·중·고등학교와 교육청·지자체를 대상으로 수학여행·체험학습·수련활동·교직원 연수·국내외 교육여행과 일본 유학 프로그램을 기획·운영해 온 교육여행 전문 기업입니다.`,
    "",
    "## 회사 정보",
    "",
    `- 회사명: ${c.name} / ${c.englishName}`,
    `- 설립: ${c.founded} (업력 ${YEARS_OF_EXPERIENCE}년)`,
    `- 대표: ${c.representative}`,
    `- 업종: ${c.businessType}`,
    `- 전화: ${c.phone} (${c.businessHours})`,
    `- 이메일: ${c.email}`,
    `- 주소: ${c.address}`,
    `- 웹사이트: ${site}`,
    "- 수상: 2025 교육여행부문 인천시장상",
    "",
  ].join("\n");
}

function links(site: string): string {
  const c = COMPANY_INFO;
  return [
    "## 주요 페이지",
    "",
    `- [프로그램 전체](${site}/programs): 분야·대상(초·중·고·교직원)·시기별로 고르는 프로그램 카드뉴스`,
    ...PROGRAM_CATEGORIES.map((cat) => `- [${cat}](${site}/programs?category=${encodeURIComponent(cat)})`),
    `- [현장체험학습·수학여행 준비 기준](${site}/guides/field-trip): 지역별 안전요원 기준, 교육청·지자체 지원, 업체 계약 방법, 교사 면책 규정(출처 포함)`,
    `- [수학여행·체험학습 1인당 비용](${site}/guides/trip-cost): 학교 입찰 공고 금액을 목적지(제주·국내·수련활동·일본·해외)·기간별로 매일 다시 집계한 참고 금액`,
    `- [진행 행사 포트폴리오](${site}/events)`,
    `- [운영 실적](${site}/achievements)`,
    `- [교사 멤버십](${site}/membership): 업무 양식·지원사업 안내를 받는 무료 멤버십`,
    `- [자주 묻는 질문](${site}/faq)`,
    `- [견적·상담 문의](${site}/inquiry)`,
    `- [회사 소개](${site}/about)`,
    "",
    "## 공식 채널",
    "",
    `- 네이버 블로그(교육여행 노트): ${c.naverBlog}`,
    `- 유튜브: ${c.youtube}`,
    `- 카카오톡 채널: ${c.kakaoChannel}`,
    `- 인스타그램: ${c.instagram}`,
    `- 페이스북: ${c.facebook}`,
    "",
  ].join("\n");
}

const programUrl = (site: string, p: Program) => {
  const l = p.link?.trim();
  if (l?.startsWith("http")) return l;
  return `${site}${l?.startsWith("/") ? l : `/news/${p.id}`}`;
};

/** llms.txt — 짧은 요약 (최근 프로그램 12개 + FAQ 질문·답 첫 문장) */
export async function buildLlmsTxt(): Promise<string> {
  const site = getSiteUrl();
  const programs = (await loadPrograms()).slice(0, 12);
  return [
    header(site),
    links(site),
    "## 최근 프로그램",
    "",
    ...programs.map((p) => `- [${stripBrandFromTitle(p.title)}](${programUrl(site, p)}): ${oneLine(p.summary).slice(0, 140)}`),
    "",
    `전체 목록과 자세한 설명: ${site}/llms-full.txt`,
    "",
    "## 자주 묻는 질문",
    "",
    ...FAQS.map((f) => `- ${f.question} ${f.answer.split(/(?<=\.)\s/)[0]}`),
    "",
  ].join("\n");
}

/** llms-full.txt — 운영 중인 프로그램 전체(분야별) + FAQ 전문 */
export async function buildLlmsFullTxt(): Promise<string> {
  const site = getSiteUrl();
  const programs = await loadPrograms();
  const byCategory = PROGRAM_CATEGORIES.map((cat) => ({ cat, items: programs.filter((p) => p.categories.includes(cat)) })).filter((g) => g.items.length);
  return [
    header(site),
    links(site),
    `## 운영 중인 프로그램 (${programs.length}개, 분야별)`,
    "",
    ...byCategory.flatMap(({ cat, items }) => [
      `### ${cat}`,
      "",
      ...items.map((p) => {
        const tags = p.hashtags.map((t) => t.replace(/^#/, "")).join(", ");
        return `- [${stripBrandFromTitle(p.title)}](${programUrl(site, p)})${tags ? ` (${tags})` : ""}\n  ${oneLine(p.summary)}`;
      }),
      "",
    ]),
    "## 자주 묻는 질문",
    "",
    ...FAQS.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
  ].join("\n");
}

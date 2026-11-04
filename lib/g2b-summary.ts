import OpenAI from "openai";
import { extractText, getDocumentProxy } from "unpdf";

/**
 * 나라장터 입찰 공고의 첨부 공고문(PDF)을 읽어, 참여 여부를 판단하는 데 필요한 항목만 뽑는다.
 * 공고 API에는 제목·금액·마감만 있고 기간·인원·참가자격(지역 제한 등)·평가 방식은 첨부 문서에만 있어,
 * 알림 메일만 보고 참여할 건을 고를 수 있게 한다. HWP만 첨부된 공고는 요약하지 않는다(null).
 */

export interface NoticeSummary {
  기간: string | null;
  장소: string | null;
  인원: string | null;
  기초금액: string | null;
  "1인당": string | null;
  계약방법: string | null;
  평가방식: string | null;
  참가자격: string | null;
  지역제한: string | null;
  제안서마감: string | null;
  설명회: string | null;
  특이사항: string | null;
}

/** 공고 API 항목 중 첨부 파일 관련 필드 (ntceSpecFileNm1~10 / ntceSpecDocUrl1~10) */
type AttachmentFields = Record<string, string | undefined>;

const MODEL = process.env.OPENAI_SUMMARY_MODEL || "gpt-5.4-mini";
// 공고문 핵심(기간·인원·금액·자격·평가)은 앞쪽에 있다. 뒤쪽 서식·청렴서약까지 보내면 비용만 늘어난다.
const MAX_TEXT_CHARS = 25_000;
const MAX_PDF_BYTES = 15 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 20_000;

const PROMPT = `학교 교육여행 입찰 공고문입니다. 여행사가 참여 여부를 판단하는 데 필요한 항목만 아래 JSON 키로 뽑아 주세요.
문서에 없는 항목은 null. 각 값은 한 줄로 짧게. 숫자·날짜는 문서 표기 그대로.
{"기간":"","장소":"","인원":"학생 n명, 교원 n명","기초금액":"","1인당":"기초금액을 총인원으로 나눈 대략값","계약방법":"",
"평가방식":"제안서 평가 여부·통과 점수·낙찰 방식 핵심","참가자격":"업종·기업 규모 등","지역제한":"본점 소재지 제한 지역(없으면 '없음')",
"제안서마감":"","설명회":"","특이사항":"안전요원·보험·숙소 등급 등 핵심 1~2개"}`;

let client: OpenAI | null = null;
const openai = () => (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

/** 첨부 중 PDF 하나를 고른다 — 공고문 → 과업지시서·제안요청서 → 나머지 순 */
export function pickPdfAttachment(item: AttachmentFields): { name: string; url: string } | null {
  const files: { name: string; url: string }[] = [];
  for (let i = 1; i <= 10; i++) {
    const name = item[`ntceSpecFileNm${i}`];
    const url = item[`ntceSpecDocUrl${i}`];
    if (name && url && /\.pdf$/i.test(name.trim())) files.push({ name: name.trim(), url });
  }
  const rank = (n: string) => (/공고/.test(n) ? 0 : /과업|제안요청|지시서/.test(n) ? 1 : 2);
  return files.sort((a, b) => rank(a.name) - rank(b.name))[0] ?? null;
}

async function downloadPdf(url: string): Promise<Uint8Array | null> {
  const res = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!res.ok) return null;
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > MAX_PDF_BYTES || buf[0] !== 0x25 /* % */) return null; // PDF가 아니면(로그인 페이지 등) 건너뜀
  return buf;
}

export async function summarizeNotice(item: AttachmentFields): Promise<NoticeSummary | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const pdf = pickPdfAttachment(item);
  if (!pdf) return null;

  const buf = await downloadPdf(pdf.url);
  if (!buf) return null;
  const { text } = await extractText(await getDocumentProxy(buf), { mergePages: true });
  const body = text.replace(/[ \t]+/g, " ").trim().slice(0, MAX_TEXT_CHARS);
  if (body.length < 200) return null; // 스캔 이미지 PDF 등 글자가 없는 문서

  const completion = await openai().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: `${PROMPT}\n\n===== 공고문 (${pdf.name}) =====\n${body}` }],
    response_format: { type: "json_object" },
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;
  return JSON.parse(raw) as NoticeSummary;
}

/**
 * 지역 제한 기준으로 서울 본점(터치더월드)이 참여할 수 있는지. 판단할 수 없으면 null.
 * 지역 제한이 없거나 허용 지역에 서울이 들어 있으면 참여 가능.
 */
export function seoulEligible(summary: Pick<NoticeSummary, "지역제한"> | null | undefined): boolean | null {
  const limit = summary?.지역제한?.trim();
  if (!limit) return null;
  if (/^(없음|해당\s*없음|제한\s*없음|전국)/.test(limit)) return true;
  return /서울/.test(limit);
}

/** 메일·관리자 화면에 보여 줄 순서와 이름 */
export const SUMMARY_ROWS: [keyof NoticeSummary, string][] = [
  ["기간", "기간"],
  ["장소", "장소"],
  ["인원", "인원"],
  ["기초금액", "기초금액"],
  ["1인당", "1인당"],
  ["지역제한", "지역 제한"],
  ["참가자격", "참가 자격"],
  ["평가방식", "평가 방식"],
  ["제안서마감", "제안서 마감"],
  ["설명회", "설명회"],
  ["특이사항", "특이사항"],
];

/**
 * 프로그램 탭 "누구와 가시나요" — 카드뉴스가 어느 학교급·대상에 맞는지 판정한다.
 *
 * 기준은 해시태그(HASHTAG_TARGETS)다. 다만 해시태그는 글당 대상 1~2개로 정해 두어서,
 * 본문에 "초·중·고", "초등학교, 중학교, 고등학교"처럼 여러 학교급이 함께 대상으로 적힌 글은
 * 태그에 없는 학교급에서도 보이게 본문에서 보완한다. 학교급 하나가 지나가듯 언급된 경우
 * (예: "현지 고등학교와 교류")는 대상으로 보지 않는다.
 */

export const AUDIENCES = [
  { key: "초등", label: "초등학교" },
  { key: "중등", label: "중학교" },
  { key: "고등", label: "고등학교" },
  { key: "특성화고", label: "특성화고" },
  { key: "교직원", label: "교직원" },
] as const;

export type AudienceKey = (typeof AUDIENCES)[number]["key"];

const AUDIENCE_KEYS = AUDIENCES.map((a) => a.key) as readonly string[];

export function isAudienceKey(value: unknown): value is AudienceKey {
  return typeof value === "string" && AUDIENCE_KEYS.includes(value);
}

// 해시태그 → 대상. #교사는 #교직원과 같은 대상으로 본다.
const TAG_TO_AUDIENCE: Record<string, AudienceKey> = {
  "#초등": "초등",
  "#중등": "중등",
  "#고등": "고등",
  "#특성화고": "특성화고",
  "#교직원": "교직원",
  "#교사": "교직원",
};

const SEP = "\\s*[·ㆍ,/]?\\s*";
// 여러 학교급을 한꺼번에 대상으로 적은 표현만 본다
const ALL_LEVELS = new RegExp(`초(?:등(?:학교|학생)?)?${SEP}중(?:학교|학생|등)?${SEP}고(?:등(?:학교|학생)?|교)?`, "g"); // 초·중·고, 초중고, 초·중고, 초등학교, 중학교, 고등학교
const MIDDLE_HIGH = new RegExp(`중(?:학교|학생|등)?\\s*[·ㆍ]\\s*고(?:등(?:학교|학생)?|교)?`, "g"); // 중·고, 중·고등학교
// 초·중 (뒤에 "·고"가 이어지면 위 ALL_LEVELS가 판정한다)
const ELEM_MIDDLE = new RegExp(`초(?:등(?:학교|학생)?)?\\s*[·ㆍ]\\s*중(?!국)(?:학교|학생|등)?(?!${SEP}고)`, "g");
// "초·중·고 교원", "중·고등학교 선생님"처럼 바로 뒤에 선생님을 뜻하는 말이 오면 학생 학교급이 아니라 선생님 소속이다
const TEACHER_AFTER = /^\s*(?:교원|교사|교직원|선생|교장|교감|관리자)/;

function mentionsForStudents(re: RegExp, text: string): boolean {
  for (const m of text.matchAll(re)) {
    if (!TEACHER_AFTER.test(text.slice(m.index! + m[0].length, m.index! + m[0].length + 8))) return true;
  }
  return false;
}

export function audiencesFromContent(text: string): AudienceKey[] {
  const found = new Set<AudienceKey>();
  if (mentionsForStudents(ALL_LEVELS, text)) ["초등", "중등", "고등"].forEach((k) => found.add(k as AudienceKey));
  if (mentionsForStudents(MIDDLE_HIGH, text)) ["중등", "고등"].forEach((k) => found.add(k as AudienceKey));
  if (mentionsForStudents(ELEM_MIDDLE, text)) ["초등", "중등"].forEach((k) => found.add(k as AudienceKey));
  return AUDIENCES.map((a) => a.key).filter((k) => found.has(k));
}

export function getAudiences(item: { hashtags: string[]; content?: string | null; summary?: string | null }): AudienceKey[] {
  const found = new Set<AudienceKey>();
  for (const tag of item.hashtags) {
    const key = TAG_TO_AUDIENCE[tag.startsWith("#") ? tag : `#${tag}`];
    if (key) found.add(key);
  }
  for (const key of audiencesFromContent(`${item.summary ?? ""}\n${item.content ?? ""}`)) found.add(key);
  return AUDIENCES.map((a) => a.key).filter((k) => found.has(k));
}

export function audienceLabel(key: AudienceKey): string {
  return AUDIENCES.find((a) => a.key === key)!.label;
}

/**
 * 문의 유입 경로 — 방문자가 처음(first)·가장 최근(last)에 어디서 들어왔는지를 브라우저에 적어두었다가
 * 문의를 남길 때 함께 저장한다. GA4는 개인 문의와 연결되지 않으므로 "어느 채널이 실제 문의를 만들었나"는
 * 이 기록으로만 알 수 있다.
 */

export interface Touch {
  /** 들어온 첫 페이지 (경로 + 쿼리) */
  landing: string;
  /** 바깥 사이트에서 왔을 때의 referrer 호스트 (사이트 안 이동은 기록하지 않음) */
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** ISO 시각 */
  at: string;
}

export interface Attribution {
  first?: Touch;
  last?: Touch;
}

export const CHANNELS = [
  "구글 검색",
  "네이버 검색",
  "다음·기타 검색",
  "유튜브",
  "카카오",
  "인스타그램",
  "AI 어시스턴트",
  "기타 사이트",
  "직접 방문",
  "알 수 없음",
] as const;
export type Channel = (typeof CHANNELS)[number];

const MAX_LEN = 300;

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, MAX_LEN);
  return trimmed || undefined;
}

function cleanTouch(value: unknown): Touch | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const landing = cleanString(v.landing);
  const at = cleanString(v.at);
  if (!landing || !at || Number.isNaN(Date.parse(at))) return undefined;
  return {
    landing,
    at,
    referrer: cleanString(v.referrer),
    utmSource: cleanString(v.utmSource),
    utmMedium: cleanString(v.utmMedium),
    utmCampaign: cleanString(v.utmCampaign),
  };
}

/** 클라이언트가 보낸 값을 그대로 믿지 않고, 알려진 필드만 길이 제한해서 남긴다. */
export function sanitizeAttribution(value: unknown): Attribution | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const first = cleanTouch(v.first);
  const last = cleanTouch(v.last);
  if (!first && !last) return null;
  return { ...(first ? { first } : {}), ...(last ? { last } : {}) };
}

/** 지금 페이지 진입 정보로 Touch를 만든다. 사이트 안에서 이동한 것이면 null. */
export function buildTouch(location: { pathname: string; search: string }, referrer: string, siteHost: string, now = new Date()): Touch | null {
  let refHost: string | undefined;
  try {
    refHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : undefined;
  } catch {
    refHost = undefined;
  }
  const params = new URLSearchParams(location.search);
  const utmSource = cleanString(params.get("utm_source"));
  const isInternal = refHost && refHost === siteHost.replace(/^www\./, "");
  if (isInternal && !utmSource) return null;

  return {
    landing: `${location.pathname}${location.search}`.slice(0, MAX_LEN),
    at: now.toISOString(),
    ...(refHost && !isInternal ? { referrer: refHost } : {}),
    ...(utmSource ? { utmSource } : {}),
    ...(params.get("utm_medium") ? { utmMedium: cleanString(params.get("utm_medium")) } : {}),
    ...(params.get("utm_campaign") ? { utmCampaign: cleanString(params.get("utm_campaign")) } : {}),
  };
}

export function classifyTouch(touch: Touch | undefined): Channel {
  if (!touch) return "알 수 없음";
  const source = (touch.utmSource || "").toLowerCase();
  const ref = (touch.referrer || "").toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => source.includes(k) || ref.includes(k));

  if (has("youtube", "youtu.be")) return "유튜브";
  if (has("kakao")) return "카카오";
  if (has("instagram")) return "인스타그램";
  if (has("chatgpt", "openai", "perplexity", "claude.ai", "gemini.google", "copilot")) return "AI 어시스턴트";
  if (has("google")) return "구글 검색";
  if (has("naver")) return "네이버 검색";
  if (has("daum", "bing", "zum", "yahoo")) return "다음·기타 검색";
  if (touch.referrer || touch.utmSource) return "기타 사이트";
  return "직접 방문";
}

// 출처 정보 없이(주소창 입력·새로고침·새 탭) 들어온 방문이 이 시간 안이면 같은 방문으로 보고 덮어쓰지 않는다.
const SAME_VISIT_MS = 30 * 60 * 1000;

/** 저장된 기록에 이번 진입을 반영한 결과. 바꿀 필요가 없으면 null. */
export function mergeTouch(saved: Attribution | null, touch: Touch): Attribution | null {
  const last = saved?.last;
  const isDirect = !touch.referrer && !touch.utmSource;
  if (isDirect && last && Date.parse(touch.at) - Date.parse(last.at) < SAME_VISIT_MS) return null;
  return { first: saved?.first ?? touch, last: touch };
}

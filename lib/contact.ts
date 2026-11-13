import { COMPANY_INFO } from "@/lib/constants";

/** 카카오톡 채널 주소 — 환경변수가 있으면 우선, 채널 ID만 있으면 pf.kakao.com 주소로 바꾼다. 없으면 null */
export function getKakaoChannelUrl(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ||
    process.env.KAKAO_CHANNEL_URL ||
    COMPANY_INFO.kakaoChannel;
  const value = raw?.trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  return `https://pf.kakao.com/_${value.replace(/^_+/, "")}`;
}

/** tel: 링크용 — "1800-8078" → "tel:18008078" */
export function telHref(phone: string = COMPANY_INFO.phone): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

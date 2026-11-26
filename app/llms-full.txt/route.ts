import { buildLlmsFullTxt } from "@/lib/llms";

// AI 검색용 전체 문서 — 운영 중인 프로그램 전체와 FAQ 전문 (lib/llms.ts)
export const revalidate = 3600;

export async function GET() {
  return new Response(await buildLlmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

import { buildLlmsTxt } from "@/lib/llms";

// AI 검색용 회사 요약 — 회사 정보·FAQ·카드뉴스에서 만든다 (lib/llms.ts)
export const revalidate = 3600;

export async function GET() {
  return new Response(await buildLlmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

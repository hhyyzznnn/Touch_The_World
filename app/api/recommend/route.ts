import { NextRequest, NextResponse } from "next/server";
import { getProgramCatalog } from "@/lib/program-catalog";
import { recommendFromHistory } from "@/lib/news-related";
import { stripBrandFromTitle } from "@/lib/news-utils";

/**
 * 본 글 기록(브라우저에만 저장된 카드뉴스 ID 목록)으로 추천 1건을 돌려준다.
 * 개인정보는 받지 않는다 — ID 목록만 받고, 저장하지 않는다.
 */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("viewed") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[\w-]{1,120}$/.test(s))
    .slice(0, 20);

  const catalog = await getProgramCatalog();
  const byId = new Map(catalog.map((c) => [c.id, c]));
  const viewed = ids.map((id) => byId.get(id)).filter((v): v is NonNullable<typeof v> => !!v);
  const rec = recommendFromHistory(viewed, catalog);

  const body = rec
    ? {
        item: {
          id: rec.item.id,
          title: stripBrandFromTitle(rec.item.title),
          imageUrl: rec.item.imageUrl,
          href: rec.item.link?.trim() || `/news/${rec.item.id}`,
        },
        reason: rec.reason,
      }
    : { item: null };

  return NextResponse.json(body, { headers: { "Cache-Control": "private, max-age=60" } });
}

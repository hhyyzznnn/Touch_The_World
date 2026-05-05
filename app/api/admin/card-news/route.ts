import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, apiError, apiSuccess } from "@/lib/api-helpers";
import { CompanyNewsType } from "@prisma/client";

export const runtime = "nodejs";

/**
 * GET /api/admin/card-news
 * 카드뉴스 목록 반환
 */
export async function GET(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const list = await prisma.companyNews.findMany({
    where: {
      type: CompanyNewsType.PROGRAM_CARD_NEWS,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      imageUrl: true,
      imageUrls: true,
      isPinned: true,
      createdAt: true,
    },
  });

  return apiSuccess(list);
}

/**
 * POST /api/admin/card-news
 * 카드뉴스 게시물 생성 (이미지는 이미 업로드된 URL 목록으로 전달)
 *
 * Request body (JSON):
 *   title       string  required
 *   category    string  optional  (예: "교사연수")
 *   summary     string  optional
 *   content     string  optional
 *   link        string  optional
 *   isPinned    boolean optional  default false
 *   imageUrl    string  optional  썸네일 URL (없으면 imageUrls[0] 사용)
 *   imageUrls   string[] required  카드뉴스 이미지 URL 목록 (순서 중요)
 *
 * OpenClaw 사용 플로우:
 *   1) 첨부 이미지 각각 → POST /api/admin/news/images  (multipart, file)
 *      → { url: "https://utfs.io/..." }
 *   2) 수집한 URL 목록 + 메타데이터 → POST /api/admin/card-news  (JSON)
 *      → { success: true, id, imageUrl, imageUrls, imageCount }
 */
export async function POST(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    const title = String(body.title || "").trim();
    if (!title) {
      return apiError("title 필드는 필수입니다.", 400);
    }

    const imageUrls: string[] = Array.isArray(body.imageUrls)
      ? body.imageUrls.map((u: unknown) => String(u).trim()).filter(Boolean)
      : [];

    const thumbnailUrl = String(body.imageUrl || body.thumbnail || "").trim() || imageUrls[0] || null;

    const news = await prisma.companyNews.create({
      data: {
        type: CompanyNewsType.PROGRAM_CARD_NEWS,
        category: String(body.category || "").trim() || null,
        title,
        summary: String(body.summary || "").trim() || null,
        content: String(body.content || "").trim() || null,
        imageUrl: thumbnailUrl,
        imageUrls,
        link: String(body.link || "").trim() || null,
        isPinned: Boolean(body.isPinned),
      },
    });

    return apiSuccess({
      success: true,
      id: news.id,
      imageUrl: news.imageUrl,
      imageUrls: news.imageUrls,
      imageCount: news.imageUrls.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`카드뉴스 등록 실패: ${message}`, 500, error);
  }
}

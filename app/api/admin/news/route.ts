import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, apiError, apiSuccess } from "@/lib/api-helpers";
import { parseAdminNewsRequest } from "@/lib/admin-news-request";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  const list = await prisma.companyNews.findMany({
    orderBy: { createdAt: "desc" },
  });
  return apiSuccess(list);
}

export async function POST(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  try {
    const { type, category, title, summary, content, imageUrl, imageUrls, link, isPinned } =
      await parseAdminNewsRequest(request);

    if (!title?.trim()) {
      return NextResponse.json({ error: "title 필드는 필수입니다." }, { status: 400 });
    }

    // imageUrl이 없으면 imageUrls[0]을 썸네일로 자동 사용
    const resolvedImageUrl = imageUrl?.trim() || imageUrls[0] || null;

    const news = await prisma.companyNews.create({
      data: {
        type,
        category: category || null,
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content?.trim() || null,
        imageUrl: resolvedImageUrl,
        imageUrls,
        link: link?.trim() || null,
        isPinned: !!isPinned,
      },
    });

    return apiSuccess({
      success: true,
      id: news.id,
      imageUrl: news.imageUrl,
      imageCount: news.imageUrls.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`게시물 등록 실패: ${message}`, 500, error);
  }
}

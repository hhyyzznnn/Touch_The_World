import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, apiError, apiSuccess } from "@/lib/api-helpers";
import { parseAdminNewsRequest } from "@/lib/admin-news-request";

export const runtime = "nodejs";

export async function GET() {
  const authError = await requireStaff();
  if (authError) return authError;

  const list = await prisma.companyNews.findMany({
    orderBy: { createdAt: "desc" },
  });
  return apiSuccess(list);
}

export async function POST(request: NextRequest) {
  const authError = await requireStaff();
  if (authError) return authError;

  try {
    const { title, summary, content, imageUrl, link, isPinned } = await parseAdminNewsRequest(request);

    if (!title?.trim()) {
      return NextResponse.json({ error: "제목을 입력하세요." }, { status: 400 });
    }

    const news = await prisma.companyNews.create({
      data: {
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        link: link?.trim() || null,
        isPinned: !!isPinned,
      },
    });

    return apiSuccess({ success: true, id: news.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`회사 소식 등록에 실패했습니다: ${message}`, 500, error);
  }
}

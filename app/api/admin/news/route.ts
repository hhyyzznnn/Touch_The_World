import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, parseRequestBody } from "@/lib/api-helpers";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const list = await prisma.companyNews.findMany({
    orderBy: { createdAt: "desc" },
  });
  return apiSuccess(list);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await parseRequestBody<{
      title: string;
      summary?: string;
      content?: string;
      link?: string;
      isPinned?: boolean;
    }>(request);
    const { title, summary, content, link, isPinned } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "제목을 입력하세요." }, { status: 400 });
    }

    const news = await prisma.companyNews.create({
      data: {
        title: title.trim(),
        summary: summary?.trim() || null,
        content: content?.trim() || null,
        link: link?.trim() || null,
        isPinned: !!isPinned,
      },
    });

    return apiSuccess({ success: true, id: news.id });
  } catch (error) {
    return apiError("회사 소식 등록에 실패했습니다.", 500, error);
  }
}

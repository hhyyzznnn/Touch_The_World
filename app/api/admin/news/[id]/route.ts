import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, parseRequestBody } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
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

    await prisma.companyNews.update({
      where: { id },
      data: {
        title: title.trim(),
        summary: summary?.trim() ?? undefined,
        content: content?.trim() ?? undefined,
        link: link?.trim() ?? undefined,
        isPinned: !!isPinned,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError("회사 소식 수정에 실패했습니다.", 500, error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.companyNews.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError("회사 소식 삭제에 실패했습니다.", 500, error);
  }
}

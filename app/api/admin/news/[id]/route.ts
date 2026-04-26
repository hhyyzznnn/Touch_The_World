import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, apiError } from "@/lib/api-helpers";
import { parseAdminNewsRequest } from "@/lib/admin-news-request";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { type, category, title, summary, content, imageUrl, imageUrls, link, isPinned } = await parseAdminNewsRequest(request);

    if (!title?.trim()) {
      return NextResponse.json({ error: "제목을 입력하세요." }, { status: 400 });
    }

    await prisma.companyNews.update({
      where: { id },
      data: {
        type,
        category: category || null,
        title: title.trim(),
        summary: summary?.trim() ?? undefined,
        content: content?.trim() ?? undefined,
        imageUrl: imageUrl?.trim() || null,
        imageUrls,
        link: link?.trim() ?? undefined,
        isPinned: !!isPinned,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`회사 소식 수정에 실패했습니다: ${message}`, 500, error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.companyNews.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError("회사 소식 삭제에 실패했습니다.", 500, error);
  }
}

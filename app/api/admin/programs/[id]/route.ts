import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, parseRequestBody } from "@/lib/api-helpers";

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
      category: string;
      summary?: string;
      description?: string;
      schedules?: Array<{ day: number; description: string }>;
      imageUrls?: string[];
      thumbnailUrl?: string;
    }>(request);
    const { title, category, summary, description, schedules, imageUrls, thumbnailUrl } = body;

    // 기존 일정 및 이미지 삭제
    await prisma.programSchedule.deleteMany({
      where: { programId: id },
    });
    await prisma.programImage.deleteMany({
      where: { programId: id },
    });

    const program = await prisma.program.update({
      where: { id },
      data: {
        title,
        category,
        summary: summary || null,
        description: description || null,
        thumbnailUrl: thumbnailUrl || null,
        schedules: {
          create: schedules?.map((s: { day: number; description: string }) => ({
            day: s.day,
            description: s.description,
          })) || [],
        },
        images: {
          create: imageUrls?.map((url: string) => ({ url })) || [],
        },
      },
    });

    return apiSuccess({ success: true, id: program.id });
  } catch (error) {
    return apiError("프로그램 수정에 실패했습니다.", 500, error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.program.delete({
      where: { id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return apiError("프로그램 삭제에 실패했습니다.", 500, error);
  }
}


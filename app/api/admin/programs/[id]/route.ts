import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, parseRequestBody } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await parseRequestBody(request);
    const { title, category, summary, description, schedules, imageUrls, thumbnailUrl } = body;

    // 기존 일정 및 이미지 삭제
    await prisma.programSchedule.deleteMany({
      where: { programId: params.id },
    });
    await prisma.programImage.deleteMany({
      where: { programId: params.id },
    });

    const program = await prisma.program.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await prisma.program.delete({
      where: { id: params.id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return apiError("프로그램 삭제에 실패했습니다.", 500, error);
  }
}


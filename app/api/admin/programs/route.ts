import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, apiSuccess, parseRequestBody } from "@/lib/api-helpers";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const programs = await prisma.program.findMany({
    orderBy: { title: "asc" },
  });

  return apiSuccess(programs);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await parseRequestBody(request);
    const { title, category, summary, description, schedules, imageUrls, thumbnailUrl } = body;

    const program = await prisma.program.create({
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
    return apiError("프로그램 생성에 실패했습니다.", 500, error);
  }
}


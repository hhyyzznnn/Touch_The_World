import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, summary, description, schedules } = body;

    // 기존 일정 삭제
    await prisma.programSchedule.deleteMany({
      where: { programId: params.id },
    });

    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        title,
        category,
        summary: summary || null,
        description: description || null,
        schedules: {
          create: schedules?.map((s: { day: number; description: string }) => ({
            day: s.day,
            description: s.description,
          })) || [],
        },
      },
    });

    return NextResponse.json({ success: true, id: program.id });
  } catch (error) {
    console.error("Program update error:", error);
    return NextResponse.json(
      { error: "프로그램 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.program.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Program deletion error:", error);
    return NextResponse.json(
      { error: "프로그램 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}


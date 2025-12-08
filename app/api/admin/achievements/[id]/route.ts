import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { institution, year, content } = body;

    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        institution,
        year: parseInt(year),
        content,
      },
    });

    return NextResponse.json({ success: true, id: achievement.id });
  } catch (error) {
    console.error("Achievement update error:", error);
    return NextResponse.json(
      { error: "실적 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.achievement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Achievement deletion error:", error);
    return NextResponse.json(
      { error: "실적 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}


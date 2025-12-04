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
    const { schoolId, programId, date, location, studentCount, imageUrls } = body;

    // 기존 이미지 삭제
    await prisma.eventImage.deleteMany({
      where: { eventId: params.id },
    });

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        schoolId,
        programId,
        date: new Date(date),
        location,
        studentCount: parseInt(studentCount),
        images: {
          create: imageUrls?.map((url: string) => ({ url })) || [],
        },
      },
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json(
      { error: "행사 수정에 실패했습니다." },
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
    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event deletion error:", error);
    return NextResponse.json(
      { error: "행사 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

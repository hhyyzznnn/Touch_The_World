import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, startDate, endDate, allDay, color, location } = body;

    if (!title || !startDate) {
      return NextResponse.json({ error: "제목과 날짜는 필수입니다." }, { status: 400 });
    }

    const entry = await prisma.calendarEntry.update({
      where: { id },
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay !== false,
        color: color || "gray",
        location: location || null,
      },
    });

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    console.error("CalendarEntry update error:", error);
    return NextResponse.json({ error: "일정 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.calendarEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CalendarEntry deletion error:", error);
    return NextResponse.json({ error: "일정 삭제에 실패했습니다." }, { status: 500 });
  }
}

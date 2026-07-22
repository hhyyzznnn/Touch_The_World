import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-user";

export async function POST(request: NextRequest) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { title, description, startDate, endDate, allDay, color, location } = body;

    if (!title || !startDate) {
      return NextResponse.json({ error: "제목과 날짜는 필수입니다." }, { status: 400 });
    }

    const entry = await prisma.calendarEntry.create({
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay !== false,
        color: color || "gray",
        location: location || null,
        createdById: user?.id ?? null,
      },
    });

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    console.error("CalendarEntry creation error:", error);
    return NextResponse.json({ error: "일정 생성에 실패했습니다." }, { status: 500 });
  }
}

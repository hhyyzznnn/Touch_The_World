import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { schoolId, programId, date, location, studentCount, imageUrls } = body;

    const event = await prisma.event.create({
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
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "행사 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

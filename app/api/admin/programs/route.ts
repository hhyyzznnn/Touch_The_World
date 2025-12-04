import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const programs = await prisma.program.findMany({
    orderBy: { title: "asc" },
  });

  return NextResponse.json(programs);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, summary, description, schedules } = body;

    const program = await prisma.program.create({
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
    console.error("Program creation error:", error);
    return NextResponse.json(
      { error: "프로그램 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}


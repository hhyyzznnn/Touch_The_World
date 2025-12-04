import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { institution, year, content } = body;

    const achievement = await prisma.achievement.create({
      data: {
        institution,
        year: parseInt(year),
        content,
      },
    });

    return NextResponse.json({ success: true, id: achievement.id });
  } catch (error) {
    console.error("Achievement creation error:", error);
    return NextResponse.json(
      { error: "실적 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}


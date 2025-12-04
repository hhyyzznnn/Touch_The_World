import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(schools);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, logoUrl, themeColor } = body;

    const school = await prisma.school.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        themeColor: themeColor || null,
      },
    });

    return NextResponse.json({ success: true, id: school.id });
  } catch (error) {
    console.error("School creation error:", error);
    return NextResponse.json(
      { error: "학교 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}


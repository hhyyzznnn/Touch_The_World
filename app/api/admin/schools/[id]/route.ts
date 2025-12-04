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
    const { name, logoUrl, themeColor } = body;

    const school = await prisma.school.update({
      where: { id: params.id },
      data: {
        name,
        logoUrl: logoUrl || null,
        themeColor: themeColor || null,
      },
    });

    return NextResponse.json({ success: true, id: school.id });
  } catch (error) {
    console.error("School update error:", error);
    return NextResponse.json(
      { error: "학교 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}


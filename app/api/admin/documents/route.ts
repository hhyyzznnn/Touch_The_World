import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, fileUrl, category } = body;

    const document = await prisma.document.create({
      data: {
        title,
        fileUrl,
        category,
      },
    });

    return NextResponse.json({ success: true, id: document.id });
  } catch (error) {
    console.error("Document creation error:", error);
    return NextResponse.json(
      { error: "자료 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}


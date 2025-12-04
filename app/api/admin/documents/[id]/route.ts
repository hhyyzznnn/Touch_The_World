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
    const { title, fileUrl, category } = body;

    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        title,
        fileUrl,
        category,
      },
    });

    return NextResponse.json({ success: true, id: document.id });
  } catch (error) {
    console.error("Document update error:", error);
    return NextResponse.json(
      { error: "자료 수정에 실패했습니다." },
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
    await prisma.document.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document deletion error:", error);
    return NextResponse.json(
      { error: "자료 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

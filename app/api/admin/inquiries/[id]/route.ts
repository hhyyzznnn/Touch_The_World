import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !["pending", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다." },
        { status: 400 }
      );
    }

    await prisma.inquiry.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry update error:", error);
    return NextResponse.json(
      { error: "문의 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !["pending", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태입니다." },
        { status: 400 }
      );
    }

    const updated = await prisma.inquiry.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error("Inquiry update error:", error);
    return NextResponse.json(
      { error: "문의 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}


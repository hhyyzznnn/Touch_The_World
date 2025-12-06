import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "고객사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Client fetch error:", error);
    return NextResponse.json(
      { error: "고객사 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, country, logoUrl, description } = body;

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        type,
        country: country || "KR",
        logoUrl,
        description,
      },
    });

    return NextResponse.json({ success: true, id: client.id });
  } catch (error) {
    console.error("Client update error:", error);
    return NextResponse.json(
      { error: "고객사 수정에 실패했습니다." },
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
    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Client deletion error:", error);
    return NextResponse.json(
      { error: "고객사 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}


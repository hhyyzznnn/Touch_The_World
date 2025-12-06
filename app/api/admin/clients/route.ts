import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, country, logoUrl, description } = body;

    const client = await prisma.client.create({
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
    console.error("Client creation error:", error);
    return NextResponse.json(
      { error: "고객사 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}


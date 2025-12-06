import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, region, duration, partner, target, description, imageUrl } = body;

    const product = await prisma.product.create({
      data: {
        title,
        category,
        region,
        duration,
        partner,
        target,
        description,
        imageUrl,
      },
    });

    return NextResponse.json({ success: true, id: product.id });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "상품 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}


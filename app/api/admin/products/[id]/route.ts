import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/auth";

function normalizeImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return Array.from(new Set(cleaned));
}

function normalizeLegacyImageUrl(value: unknown): string[] {
  if (typeof value !== "string") return [];
  const normalized = value.trim();
  return normalized ? [normalized] : [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "상품 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, category, region, duration, partner, target, description } = body;
    const imageUrls = normalizeImageUrls(body.imageUrls);
    const finalImageUrls =
      imageUrls.length > 0 ? imageUrls : normalizeLegacyImageUrl(body.imageUrl);
    const primaryImageUrl = finalImageUrls[0] || null;

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        category,
        region,
        duration,
        partner,
        target,
        description,
        imageUrl: primaryImageUrl,
        images: {
          deleteMany: {},
          create: finalImageUrls.map((url) => ({ url })),
        },
      },
    });

    return NextResponse.json({ success: true, id: product.id });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "상품 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { error: "상품 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

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

export async function POST(request: NextRequest) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, region, duration, partner, target, description } = body;
    const imageUrls = normalizeImageUrls(body.imageUrls);
    const finalImageUrls =
      imageUrls.length > 0 ? imageUrls : normalizeLegacyImageUrl(body.imageUrl);
    const primaryImageUrl = finalImageUrls[0] || null;

    const product = await prisma.product.create({
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
          create: finalImageUrls.map((url) => ({ url })),
        },
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

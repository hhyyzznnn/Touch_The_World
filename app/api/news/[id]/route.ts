import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** 회사 소식 상세 (공개) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const news = await prisma.companyNews.findUnique({
      where: { id },
    });
    if (!news) {
      return NextResponse.json({ error: "소식을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(news);
  } catch (error) {
    console.error("News detail error:", error);
    return NextResponse.json(
      { error: "소식을 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}

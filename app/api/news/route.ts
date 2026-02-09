import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** 메인 티커·회사소식 목록용: 최신순, 노출용 필드만 */
export async function GET() {
  try {
    const list = await prisma.companyNews.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        summary: true,
        link: true,
        isPinned: true,
        createdAt: true,
      },
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error("News list error:", error);
    return NextResponse.json(
      { error: "소식을 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}

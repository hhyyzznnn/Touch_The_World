import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 사용자 통계 조회
    const [
      reviewCount,
      favoriteCount,
      inquiryCount,
      consultingLogCount,
    ] = await Promise.all([
      prisma.review.count({
        where: { userId: user.id },
      }),
      prisma.favorite.count({
        where: { userId: user.id },
      }),
      user.email
        ? prisma.inquiry.count({
            where: { email: user.email },
          })
        : Promise.resolve(0),
      prisma.consultingLog.count({
        where: { userId: user.id },
      }),
    ]);

    // 최근 활동 내역
    const recentReviews = await prisma.review.findMany({
      where: { userId: user.id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentFavorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        reviewCount,
        favoriteCount,
        inquiryCount,
        consultingLogCount,
      },
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content.substring(0, 100) + (r.content.length > 100 ? "..." : ""),
        createdAt: r.createdAt,
        program: r.program,
      })),
      recentFavorites: recentFavorites.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        program: f.program,
      })),
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "통계를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

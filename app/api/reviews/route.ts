import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

// 후기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");
    const userId = searchParams.get("userId");

    if (!programId && !userId) {
      return NextResponse.json(
        { error: "programId 또는 userId가 필요합니다." },
        { status: 400 }
      );
    }

    const where: {
      programId?: string;
      userId?: string;
    } = {};
    if (programId) where.programId = programId;
    if (userId) where.userId = userId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json(
      { error: "후기를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 후기 작성
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { programId, rating, content } = await request.json();

    if (!programId || !rating || !content) {
      return NextResponse.json(
        { error: "프로그램 ID, 평점, 내용은 필수입니다." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 1-5 사이여야 합니다." },
        { status: 400 }
      );
    }

    // 프로그램 존재 확인
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json(
        { error: "프로그램을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 작성한 후기가 있는지 확인
    const existingReview = await prisma.review.findUnique({
      where: {
        programId_userId: {
          programId,
          userId: user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "이미 후기를 작성하셨습니다. 수정하려면 기존 후기를 수정해주세요." },
        { status: 400 }
      );
    }

    // 트랜잭션으로 후기 작성 및 프로그램 평점 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 후기 작성
      const review = await tx.review.create({
        data: {
          programId,
          userId: user.id,
          rating,
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // 프로그램의 평균 평점 및 후기 개수 업데이트
      const reviews = await tx.review.findMany({
        where: { programId },
        select: { rating: true },
      });

      const averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await tx.program.update({
        where: { id: programId },
        data: {
          rating: Math.round(averageRating * 10) / 10, // 소수점 첫째 자리까지
          reviewCount: reviews.length,
        },
      });

      return review;
    });

    return NextResponse.json({
      success: true,
      review: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Review creation error:", errorMessage);
    
    // Prisma unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "이미 후기를 작성하셨습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "후기 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

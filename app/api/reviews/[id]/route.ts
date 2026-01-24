import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

// 후기 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { rating, content } = await request.json();

    if (!rating || !content) {
      return NextResponse.json(
        { error: "평점과 내용은 필수입니다." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "평점은 1-5 사이여야 합니다." },
        { status: 400 }
      );
    }

    // 후기 소유권 확인
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        program: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "후기를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (review.userId !== user.id) {
      return NextResponse.json(
        { error: "본인의 후기만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    // 트랜잭션으로 후기 수정 및 프로그램 평점 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 후기 수정
      const updatedReview = await tx.review.update({
        where: { id },
        data: {
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

      // 프로그램의 평균 평점 업데이트
      const reviews = await tx.review.findMany({
        where: { programId: review.programId },
        select: { rating: true },
      });

      const averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await tx.program.update({
        where: { id: review.programId },
        data: {
          rating: Math.round(averageRating * 10) / 10,
        },
      });

      return updatedReview;
    });

    return NextResponse.json({
      success: true,
      review: result,
    });
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      { error: "후기 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 후기 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 후기 소유권 확인
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        program: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "후기를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관리자 또는 본인만 삭제 가능
    if (review.userId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "본인의 후기만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 트랜잭션으로 후기 삭제 및 프로그램 평점 업데이트
    await prisma.$transaction(async (tx) => {
      // 후기 삭제
      await tx.review.delete({
        where: { id },
      });

      // 프로그램의 평균 평점 및 후기 개수 업데이트
      const reviews = await tx.review.findMany({
        where: { programId: review.programId },
        select: { rating: true },
      });

      if (reviews.length > 0) {
        const averageRating =
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await tx.program.update({
          where: { id: review.programId },
          data: {
            rating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length,
          },
        });
      } else {
        // 후기가 없으면 평점과 개수를 0으로 설정
        await tx.program.update({
          where: { id: review.programId },
          data: {
            rating: 0,
            reviewCount: 0,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Review deletion error:", error);
    return NextResponse.json(
      { error: "후기 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

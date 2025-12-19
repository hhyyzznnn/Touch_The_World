import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 프로그램 존재 확인
    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json(
        { error: "프로그램을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 좋아요가 있는지 확인
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_programId: {
          userId: user.id,
          programId: id,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "이미 좋아요한 프로그램입니다." },
        { status: 400 }
      );
    }

    // 좋아요 추가
    await prisma.favorite.create({
      data: {
        userId: user.id,
        programId: id,
      },
    });

    return NextResponse.json({ success: true, liked: true });
  } catch (error) {
    console.error("Favorite creation error:", error);
    return NextResponse.json(
      { error: "좋아요 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 좋아요 삭제
    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        programId: id,
      },
    });

    return NextResponse.json({ success: true, liked: false });
  } catch (error) {
    console.error("Favorite deletion error:", error);
    return NextResponse.json(
      { error: "좋아요 취소에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ liked: false });
    }

    // 좋아요 여부 확인
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_programId: {
          userId: user.id,
          programId: id,
        },
      },
    });

    return NextResponse.json({ liked: !!favorite });
  } catch (error) {
    console.error("Favorite check error:", error);
    return NextResponse.json({ liked: false });
  }
}

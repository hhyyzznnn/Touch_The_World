import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { name, phone, school } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "이름은 필수입니다." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: phone || null,
        school: school || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        school: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "정보 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}


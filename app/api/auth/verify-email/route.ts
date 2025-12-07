import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 400 }
      );
    }

    // 토큰으로 인증 정보 찾기
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "유효하지 않은 인증 토큰입니다." },
        { status: 400 }
      );
    }

    // 만료 확인
    if (new Date() > verification.expiresAt) {
      // 만료된 토큰 삭제
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        { error: "인증 토큰이 만료되었습니다. 다시 회원가입해주세요." },
        { status: 400 }
      );
    }

    // 사용자 이메일 인증 완료
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    // 인증 토큰 삭제
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({
      success: true,
      message: "이메일 인증이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "이메일 인증에 실패했습니다." },
      { status: 500 }
    );
  }
}


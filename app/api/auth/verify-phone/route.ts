import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationSMS, generateVerificationCode } from "@/lib/sms";

// SMS 인증 코드 발송
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "휴대폰 번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 휴대폰 번호 형식 검증 (한국 형식)
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    const normalizedPhone = phone.replace(/-/g, "");
    if (!phoneRegex.test(phone) && !/^010[0-9]{8}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "올바른 휴대폰 번호 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5분 후 만료

    // 기존 인증 코드 삭제 (같은 번호의 미인증 코드)
    await prisma.phoneVerification.deleteMany({
      where: {
        phone: normalizedPhone,
        verified: false,
      },
    });

    // 새 인증 코드 저장
    await prisma.phoneVerification.create({
      data: {
        phone: normalizedPhone,
        code,
        expiresAt,
      },
    });

    // SMS 발송
    await sendVerificationSMS(normalizedPhone, code);

    return NextResponse.json({
      success: true,
      message: "인증 코드가 발송되었습니다.",
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: "인증 코드 발송에 실패했습니다." },
      { status: 500 }
    );
  }
}

// SMS 인증 코드 검증
export async function PUT(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "휴대폰 번호와 인증 코드를 입력해주세요." },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.replace(/-/g, "");

    // 인증 코드 확인
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "인증 코드가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 만료 확인
    if (new Date() > verification.expiresAt) {
      await prisma.phoneVerification.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        { error: "인증 코드가 만료되었습니다. 다시 발송해주세요." },
        { status: 400 }
      );
    }

    // 인증 완료 처리
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: "휴대폰 인증이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Phone verification check error:", error);
    return NextResponse.json(
      { error: "인증 코드 확인에 실패했습니다." },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const resendSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const ipRateLimit = await checkRateLimit(`verify-email:resend:ip:${clientIP}`, 5, 60 * 60 * 1000);
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      {
        error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        retryAfter: Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }

  try {
    const payload = await request.json();
    const parsed = resendSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "올바른 이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const emailRateLimit = await checkRateLimit(
      `verify-email:resend:email:${email}`,
      3,
      60 * 60 * 1000
    );
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "재발송 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          retryAfter: Math.ceil((emailRateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    });

    // 계정 존재 여부 노출 최소화를 위해 동일 메시지 반환
    if (!user || !user.email) {
      return NextResponse.json({
        success: true,
        message: "인증 메일을 재발송했습니다. 메일함을 확인해주세요.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "이미 이메일 인증이 완료된 계정입니다. 바로 로그인할 수 있습니다.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const emailResult = await sendVerificationEmail(user.email, user.name, token);
    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: "인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
          detail: emailResult.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "인증 메일을 재발송했습니다. 메일함을 확인해주세요.",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { error: "인증 메일 재발송에 실패했습니다." },
      { status: 500 }
    );
  }
}

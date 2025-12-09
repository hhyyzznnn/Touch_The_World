import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate Limiting: IP당 1시간에 3회 제한
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`register:${clientIP}`, 3, 60 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "회원가입 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const { email, username, password, name, phone, school } = await request.json();

    // 입력 검증
    if (!email || !username || !password || !name || !phone) {
      return NextResponse.json(
        { error: "아이디, 이메일, 비밀번호, 이름, 전화번호는 필수입니다." },
        { status: 400 }
      );
    }

    // 아이디 형식 검증 (영문/숫자/언더스코어, 3~20자)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "아이디는 3~20자의 영문, 숫자, 언더스코어만 사용할 수 있습니다." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 중복 이메일 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    // 중복 아이디 확인
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 인증 토큰 생성
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24시간 후 만료

    // 휴대폰 인증 확인
    const normalizedPhone = phone.replace(/-/g, "");
    const phoneVerification = await prisma.phoneVerification.findFirst({
      where: {
        phone: normalizedPhone,
        verified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!phoneVerification) {
      return NextResponse.json(
        { error: "휴대폰 인증을 완료해주세요." },
        { status: 400 }
      );
    }

    // 인증이 1시간 이내에 완료된 것만 유효
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    if (phoneVerification.createdAt < oneHourAgo) {
      return NextResponse.json(
        { error: "휴대폰 인증이 만료되었습니다. 다시 인증해주세요." },
        { status: 400 }
      );
    }

    const phoneVerified = true;

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        phone: phone ? phone.replace(/-/g, "") : null,
        phoneVerified,
        school: school || null,
        emailVerified: false,
        emailVerifications: {
          create: {
            token,
            expiresAt,
          },
        },
      },
    });

    // 이메일 인증 메일 발송
    await sendVerificationEmail(email, name, token);

    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "회원가입에 실패했습니다." },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthSession } from "@/lib/session-auth";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { z } from "zod";
import crypto from "crypto";

const adminLoginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimit = await checkRateLimit(`admin-login:${clientIP}`, 5, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const payload = await request.json();
    const parsed = adminLoginSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "아이디(또는 이메일)와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }
    const { identifier, password } = parsed.data;
    const normalizedIdentifier = identifier.trim().toLowerCase();

    const staffUser = await prisma.user.findFirst({
      where: {
        role: { in: ["admin", "editor"] },
        OR: [
          { username: { equals: normalizedIdentifier, mode: "insensitive" } },
          { email: { equals: normalizedIdentifier, mode: "insensitive" } },
        ],
      },
      select: { id: true, role: true, password: true, username: true },
    });

    if (!staffUser) {
      return NextResponse.json(
        { error: "계정 정보가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    let isValidPassword = false;

    if (staffUser.password) {
      isValidPassword = await bcrypt.compare(password, staffUser.password);
    }

    const fallbackAdminPassword = process.env.ADMIN_PASSWORD;
    if (
      !isValidPassword &&
      fallbackAdminPassword &&
      process.env.NODE_ENV !== "production" &&
      staffUser.role === "admin"
    ) {
      isValidPassword = safeEqual(password, fallbackAdminPassword);
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "계정 정보가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    setAuthSession(cookieStore, { userId: staffUser.id, role: staffUser.role as "admin" | "editor" });

    return NextResponse.json({ success: true, role: staffUser.role, username: staffUser.username });
  } catch (error) {
    return NextResponse.json(
      { error: "로그인에 실패했습니다." },
      { status: 500 }
    );
  }
}

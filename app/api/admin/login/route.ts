import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthSession } from "@/lib/session-auth";
import { z } from "zod";
import crypto from "crypto";

const adminLoginSchema = z.object({
  password: z.string().min(1),
});

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = adminLoginSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }
    const { password } = parsed.data;

    const adminUser = await prisma.user.findFirst({
      where: { role: "admin" },
      select: { id: true, role: true, password: true },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "관리자 계정이 설정되지 않았습니다." },
        { status: 503 }
      );
    }

    let isValidPassword = false;

    if (adminUser.password) {
      isValidPassword = await bcrypt.compare(password, adminUser.password);
    }

    const fallbackAdminPassword = process.env.ADMIN_PASSWORD;
    if (!isValidPassword && fallbackAdminPassword) {
      isValidPassword = safeEqual(password, fallbackAdminPassword);
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    setAuthSession(cookieStore, { userId: adminUser.id, role: "admin" });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "로그인에 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().optional(),
  school: z.string().trim().optional(),
  marketingEmailOptIn: z.boolean().optional(),
  marketingAlimtalkOptIn: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const parsed = profileUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값을 다시 확인해주세요." },
        { status: 400 }
      );
    }
    const {
      name,
      phone,
      school,
      marketingEmailOptIn,
      marketingAlimtalkOptIn,
    } = parsed.data;

    const nextMarketingEmailOptIn = marketingEmailOptIn ?? user.marketingEmailOptIn;
    const nextMarketingAlimtalkOptIn = marketingAlimtalkOptIn ?? user.marketingAlimtalkOptIn;
    const now = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: phone || null,
        school: school || null,
        marketingEmailOptIn: nextMarketingEmailOptIn,
        marketingEmailOptInAt: nextMarketingEmailOptIn
          ? (user.marketingEmailOptIn ? undefined : now)
          : null,
        marketingAlimtalkOptIn: nextMarketingAlimtalkOptIn,
        marketingAlimtalkOptInAt: nextMarketingAlimtalkOptIn
          ? (user.marketingAlimtalkOptIn ? undefined : now)
          : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        school: true,
        marketingEmailOptIn: true,
        marketingAlimtalkOptIn: true,
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

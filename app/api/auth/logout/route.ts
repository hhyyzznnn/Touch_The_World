import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthSession } from "@/lib/session-auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    clearAuthSession(cookieStore);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "로그아웃에 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthSession } from "@/lib/session-auth";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  clearAuthSession(cookieStore);
  // 로그인 페이지로 이동시키며 쿠키 삭제
  return NextResponse.redirect(new URL("/", request.url));
}

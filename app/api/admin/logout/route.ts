import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
  // 로그인 페이지로 이동시키며 쿠키 삭제
  return NextResponse.redirect(new URL("/admin/login", request.url));
}


import { NextResponse } from "next/server";

export async function GET() {
  const kakao = Boolean(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET);
  const naver = Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
  const google = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return NextResponse.json({
    kakao,
    naver,
    google,
  });
}

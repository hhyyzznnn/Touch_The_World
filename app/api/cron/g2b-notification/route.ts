/**
 * 나라장터 알림 크론 작업
 * Vercel Cron: 매일 오전 9시 실행
 */

import { NextRequest, NextResponse } from "next/server";
import { processG2BNotifications } from "@/lib/g2b-notification";

export async function GET(request: NextRequest) {
  // 보안: CRON_SECRET_KEY 확인
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET_KEY;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processG2BNotifications();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("크론 작업 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


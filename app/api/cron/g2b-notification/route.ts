/**
 * 나라장터 알림 크론 작업
 * Vercel Cron: 매일 오전 9시 실행
 */

import { NextRequest, NextResponse } from "next/server";
import { processG2BNotifications } from "@/lib/g2b-notification";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // 보안: Vercel은 CRON_SECRET, 프로젝트는 CRON_SECRET_KEY 사용 가능
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET(또는 CRON_SECRET_KEY)가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processG2BNotifications();

    // 7일 지난 공고 중 마감도 지난(또는 마감일 없는) 것만 지운다 —
    // 마감 전 공고는 관리자 "학교별 연락 시기"의 입찰 진행 중 목록에 계속 보여야 한다.
    const now = new Date();
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { count: deleted } = await prisma.g2BNotice.deleteMany({
      where: {
        createdAt: { lt: cutoff },
        OR: [{ deadline: { lt: now } }, { deadline: null }],
      },
    });

    return NextResponse.json({
      success: true,
      ...result,
      deleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("크론 작업 실패:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

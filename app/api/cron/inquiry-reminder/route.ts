import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInquiryReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const overdue = await prisma.inquiry.findMany({
      where: {
        status: "pending",
        createdAt: { lt: cutoff },
        reminderSentAt: null,
      },
      select: {
        id: true,
        schoolName: true,
        contact: true,
        phone: true,
        email: true,
        createdAt: true,
        aiSummary: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (overdue.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "미확인 문의 없음",
        timestamp: new Date().toISOString(),
      });
    }

    await sendInquiryReminderEmail(overdue);

    await prisma.inquiry.updateMany({
      where: { id: { in: overdue.map((i) => i.id) } },
      data: { reminderSentAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      sent: overdue.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("문의 리마인더 크론 실패:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

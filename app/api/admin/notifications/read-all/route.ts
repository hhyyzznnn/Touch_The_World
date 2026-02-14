import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 최근 7일간 알림 ID 목록 조회
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [inquiries, events] = await Promise.all([
      prisma.inquiry.findMany({
        where: { status: "pending", createdAt: { gte: sevenDaysAgo } },
        select: { id: true },
      }),
      prisma.event.findMany({
        where: { status: "in_progress", createdAt: { gte: sevenDaysAgo } },
        select: { id: true },
      }),
    ]);

    const notificationIds = [
      ...inquiries.map((i) => `inquiry-${i.id}`),
      ...events.map((e) => `event-${e.id}`),
    ];

    await prisma.adminReadNotification.createMany({
      data: notificationIds.map((notificationId) => ({
        adminUserId: admin.id,
        notificationId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("모든 알림 읽음 처리 실패:", error);
    return NextResponse.json(
      { error: "모든 알림 읽음 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}

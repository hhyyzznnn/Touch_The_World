import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 최근 7일간의 알림 가져오기
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 최근 문의 (대기 상태)
    const pendingInquiries = await prisma.inquiry.findMany({
      where: {
        status: "pending",
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        schoolName: true,
        contact: true,
        createdAt: true,
      },
    });

    // 최근 이벤트 (진행 중)
    const recentEvents = await prisma.event.findMany({
      where: {
        status: "in_progress",
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        schoolId: true,
        programId: true,
        date: true,
        createdAt: true,
        school: {
          select: {
            name: true,
          },
        },
        program: {
          select: {
            title: true,
          },
        },
      },
    });

    // 알림 형식으로 변환
    const notifications = [
      ...pendingInquiries.map((inquiry) => ({
        id: `inquiry-${inquiry.id}`,
        type: "inquiry" as const,
        title: "새 문의 접수",
        message: `${inquiry.schoolName} (${inquiry.contact})`,
        link: `/admin/inquiries`,
        createdAt: inquiry.createdAt,
        read: false, // 실제로는 읽음 상태를 별도로 관리해야 함
      })),
      ...recentEvents.map((event) => ({
        id: `event-${event.id}`,
        type: "event" as const,
        title: "진행 중인 프로그램",
        message: `${event.school.name} - ${event.program.title}`,
        link: `/admin/events/${event.id}/edit`,
        createdAt: event.createdAt,
        read: false,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: notifications.slice(0, 20), // 최대 20개
      unreadCount,
    });
  } catch (error) {
    console.error("알림 가져오기 실패:", error);
    return NextResponse.json(
      { error: "알림을 가져올 수 없습니다." },
      { status: 500 }
    );
  }
}

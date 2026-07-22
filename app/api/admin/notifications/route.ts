import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, getAdminUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = await getAdminUser();

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

    // 임박한 행사 (오늘 ~ 3일 이내 출발, D-day 알림)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(todayStart.getTime() + 3 * 24 * 60 * 60 * 1000);
    threeDaysLater.setHours(23, 59, 59, 999);

    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: "in_progress",
        date: { gte: todayStart, lte: threeDaysLater },
      },
      orderBy: { date: "asc" },
      take: 10,
      select: {
        id: true,
        date: true,
        createdAt: true,
        school: { select: { name: true } },
        program: { select: { title: true } },
      },
    });

    // 임박한 자유 일정 (캘린더에 직접 등록한 일정)
    const upcomingEntries = await prisma.calendarEntry.findMany({
      where: {
        startDate: { gte: todayStart, lte: threeDaysLater },
      },
      orderBy: { startDate: "asc" },
      take: 10,
      select: { id: true, title: true, startDate: true },
    });

    // 읽음 상태 조회 (admin User가 있을 때만)
    const notificationIds = [
      ...pendingInquiries.map((i) => `inquiry-${i.id}`),
      ...recentEvents.map((e) => `event-${e.id}`),
      ...upcomingEvents.map((e) => `upcoming-event-${e.id}`),
      ...upcomingEntries.map((e) => `upcoming-entry-${e.id}`),
    ];
    const readSet = new Set<string>();
    if (admin) {
      const readRecords = await prisma.adminReadNotification.findMany({
        where: {
          adminUserId: admin.id,
          notificationId: { in: notificationIds },
        },
        select: { notificationId: true },
      });
      readRecords.forEach((r) => readSet.add(r.notificationId));
    }

    // 알림 형식으로 변환
    const notifications = [
      ...pendingInquiries.map((inquiry) => {
        const id = `inquiry-${inquiry.id}`;
        return {
          id,
          type: "inquiry" as const,
          title: "새 문의 접수",
          message: `${inquiry.schoolName} (${inquiry.contact})`,
          link: `/admin/inquiries`,
          createdAt: inquiry.createdAt,
          read: readSet.has(id),
        };
      }),
      ...recentEvents.map((event) => {
        const id = `event-${event.id}`;
        return {
          id,
          type: "event" as const,
          title: "진행 중인 프로그램",
          message: `${event.school.name} - ${event.program.title}`,
          link: `/admin/events/${event.id}/edit`,
          createdAt: event.createdAt,
          read: readSet.has(id),
        };
      }),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const dayMs = 24 * 60 * 60 * 1000;
    const urgentNotifications = [
      ...upcomingEvents.map((event) => {
        const id = `upcoming-event-${event.id}`;
        const dDay = Math.max(0, Math.round((event.date.getTime() - todayStart.getTime()) / dayMs));
        return {
          id,
          type: "upcoming" as const,
          title: dDay === 0 ? "오늘 출발 행사" : `행사 임박 (D-${dDay})`,
          message: `${event.school.name} - ${event.program.title}`,
          link: `/admin/events/${event.id}/edit`,
          createdAt: event.date,
          read: readSet.has(id),
        };
      }),
      ...upcomingEntries.map((entry) => {
        const id = `upcoming-entry-${entry.id}`;
        const dDay = Math.max(0, Math.round((entry.startDate.getTime() - todayStart.getTime()) / dayMs));
        return {
          id,
          type: "upcoming" as const,
          title: dDay === 0 ? "오늘 예정 일정" : `일정 임박 (D-${dDay})`,
          message: entry.title,
          link: `/admin/calendar/entries/${entry.id}/edit`,
          createdAt: entry.startDate,
          read: readSet.has(id),
        };
      }),
    ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const allNotifications = [...urgentNotifications, ...notifications];
    const unreadCount = allNotifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: allNotifications.slice(0, 20), // 최대 20개
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

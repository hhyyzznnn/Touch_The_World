import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Activity,
  BarChart2,
  BookOpen,
  Building2,
  Globe2,
  Mail,
  Plus,
  Search,
} from "lucide-react";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

async function getStats() {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      programs,
      events,
      inquiries,
      documents,
      thisMonthEvents,
      lastMonthEvents,
      overseasEvents,
      domesticEvents,
    ] = await Promise.all([
      prisma.program.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.inquiry.count({ where: { status: "pending" } }).catch(() => 0),
      prisma.document.count().catch(() => 0),
      prisma.event
        .count({
          where: {
            date: {
              gte: currentMonthStart,
              lte: currentMonthEnd,
            },
          },
        })
        .catch(() => 0),
      prisma.event
        .count({
          where: {
            date: {
              gte: lastMonthStart,
              lte: lastMonthEnd,
            },
          },
        })
        .catch(() => 0),
      prisma.event
        .count({
          where: { location: { contains: "해외", mode: "insensitive" } },
        })
        .catch(() => 0),
      prisma.event
        .count({
          where: { location: { contains: "국내", mode: "insensitive" } },
        })
        .catch(() => 0),
    ]);

    const monthOverMonth = lastMonthEvents > 0
      ? ((thisMonthEvents - lastMonthEvents) / lastMonthEvents * 100).toFixed(1)
      : thisMonthEvents > 0 ? "100.0" : "0.0";
    const monthOverMonthSign = parseFloat(monthOverMonth) >= 0 ? "+" : "";

    return {
      programs,
      events,
      inquiries,
      documents,
      thisMonthEvents,
      monthOverMonth,
      monthOverMonthSign,
      overseasEvents,
      domesticEvents,
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      programs: 0,
      events: 0,
      inquiries: 0,
      documents: 0,
      thisMonthEvents: 0,
      monthOverMonth: "0.0",
      monthOverMonthSign: "+",
      overseasEvents: 0,
      domesticEvents: 0,
    };
  }
}

async function getOngoingPrograms() {
  try {
    return await prisma.event.findMany({
      where: {
        status: "in_progress",
      },
      include: {
        school: true,
        program: true,
      },
      orderBy: { date: "desc" },
      take: 5,
    });
  } catch {
    return [];
  }
}

async function getRecentActivity() {
  try {
    const [programs, inquiries] = await Promise.all([
      prisma.program
        .findMany({
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: { id: true, title: true, updatedAt: true },
        })
        .catch(() => []),
      prisma.inquiry
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { id: true, schoolName: true, contact: true, createdAt: true, status: true },
        })
        .catch(() => []),
    ]);

    return { programs, inquiries };
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return { programs: [], inquiries: [] };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recent = await getRecentActivity();
  const ongoingPrograms = await getOngoingPrograms();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">대시보드</h1>
          <p className="text-text-gray text-sm">운영 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="w-full md:w-96">
          <GlobalSearchBar />
        </div>
      </div>

      {/* 요약 지표 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link
          href="/admin/programs"
          className="bg-white p-5 rounded-xl border hover:shadow-md transition flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">상품</span>
            <BookOpen className="w-5 h-5 text-brand-green-primary" />
          </div>
          <div className="text-3xl font-medium">{stats.programs}</div>
        </Link>

        <Link
          href="/admin/events"
          className="bg-white p-5 rounded-xl border hover:shadow-md transition flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">금월 진행 내역</span>
            <Activity className="w-5 h-5 text-brand-green-primary" />
          </div>
          <div className="text-3xl font-medium">{stats.thisMonthEvents}</div>
          <div className={`text-xs ${parseFloat(stats.monthOverMonth) >= 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"} inline-flex items-center px-2 py-1 rounded-full`}>
            전월 대비 {stats.monthOverMonthSign}{stats.monthOverMonth}%
          </div>
        </Link>

        <Link
          href="/admin/inquiries"
          className="bg-white p-5 rounded-xl border hover:shadow-md transition flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">대기 문의</span>
            <Mail className="w-5 h-5 text-brand-green-primary" />
          </div>
          <div className="text-3xl font-medium">{stats.inquiries}</div>
          <div className="text-xs text-amber-700 bg-amber-50 inline-flex items-center px-2 py-1 rounded-full">
            처리 필요
          </div>
        </Link>
      </div>

      {/* 진행 중인 프로그램 */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-green-primary" />
            진행 중인 프로그램 ({ongoingPrograms.length}건)
          </h2>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/admin/events">전체 보기</Link>
          </Button>
        </div>
        {ongoingPrograms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">진행 중인 프로그램이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {ongoingPrograms.map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}/edit`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="font-medium text-sm sm:text-base">{event.program.title}</div>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      진행 중
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {event.school.name} · {event.location} · 학생 {event.studentCount}명
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {format(new Date(event.date), "yyyy-MM-dd", { locale: ko })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 해외/국내 비율 */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-brand-green-primary" />
            해외 프로그램
          </div>
          <div className="text-2xl font-medium mt-2">{stats.overseasEvents}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-green-primary" />
            국내 프로그램
          </div>
          <div className="text-2xl font-medium mt-2">{stats.domesticEvents}</div>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-green-primary" />
            빠른 링크
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Button asChild size="lg" className="flex-col gap-3 py-10 px-6 text-sm">
            <Link href="/admin/programs/new" className="flex flex-col items-center gap-3">
              <BookOpen className="w-5 h-5" />
              새 상품
            </Link>
          </Button>
          <Button asChild size="lg" className="flex-col gap-3 py-10 px-6 text-sm">
            <Link href="/admin/events/new" className="flex flex-col items-center gap-3">
              <Activity className="w-5 h-5" />
              새 진행 내역
            </Link>
          </Button>
          <Button asChild size="lg" className="flex-col gap-3 py-10 px-6 text-sm">
            <Link href="/admin/documents/new" className="flex flex-col items-center gap-3">
              <BarChart2 className="w-5 h-5" />
              새 자료
            </Link>
          </Button>
          <Button asChild size="lg" className="flex-col gap-3 py-10 px-6 text-sm">
            <Link href="/admin/achievements" className="flex flex-col items-center gap-3">
              <Search className="w-5 h-5" />
              사업 실적 관리
            </Link>
          </Button>
        </div>
      </div>

      {/* 최근 활동 로그 */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-green-primary" />
            최근 활동 로그
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">상품</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {recent.programs.length === 0 && <li className="text-text-gray">기록 없음</li>}
              {recent.programs.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <Link href={`/admin/programs/${p.id}/edit`} className="text-brand-green-primary hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">문의</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {recent.inquiries.length === 0 && <li className="text-text-gray">기록 없음</li>}
              {recent.inquiries.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <Link href={`/admin/inquiries`} className="text-brand-green-primary hover:underline">
                    {i.schoolName} ({i.contact})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


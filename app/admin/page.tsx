import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, BookOpen, Inbox, Mail, Megaphone, Plus } from "lucide-react";
import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { getCurrentUser } from "@/lib/auth-user";

// 2026-11-21 정리: 진행 중 프로그램·이번 주 예정 행사·금월 진행 내역·통계 차트·해외/국내 비율·캘린더는
// 쓰인 기록이 없어(진행 내역은 모두 완료 상태, 캘린더 일정 0건) 빼고, 실제로 쓰는 문의·카드뉴스 위주로 둔다.
async function getStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [programs, pendingInquiries, monthInquiries] = await Promise.all([
    prisma.companyNews.count({ where: { type: "PROGRAM_CARD_NEWS" } }).catch(() => 0),
    prisma.inquiry.count({ where: { status: "pending", archivedAt: null } }).catch(() => 0),
    prisma.inquiry.count({ where: { archivedAt: null, createdAt: { gte: monthStart } } }).catch(() => 0),
  ]);
  return { programs, pendingInquiries, monthInquiries };
}

async function getRecentActivity() {
  try {
    const [programs, inquiries] = await Promise.all([
      prisma.companyNews
        .findMany({
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: { id: true, title: true, updatedAt: true },
        })
        .catch(() => []),
      prisma.inquiry
        .findMany({
          where: { archivedAt: null },
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
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const [stats, recent] = await Promise.all([getStats(), getRecentActivity()]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium">대시보드</h1>
          <p className="text-text-gray text-sm">문의와 홈페이지 게시물을 한눈에 확인하세요.</p>
        </div>
        <div className="w-full md:w-96">
          <GlobalSearchBar />
        </div>
      </div>

      {/* 요약 지표 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {isAdmin && (
          <Link
            href="/admin/inquiries?status=pending"
            className="bg-white p-5 rounded-xl border hover:shadow-md transition flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">대기 문의</span>
              <Mail className="w-5 h-5 text-brand-green-primary" />
            </div>
            <div className="text-3xl font-medium">{stats.pendingInquiries}</div>
            {stats.pendingInquiries > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 inline-flex w-fit items-center px-2 py-1 rounded-full">처리 필요</div>
            )}
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/admin/inquiries"
            className="bg-white p-5 rounded-xl border hover:shadow-md transition flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">이번 달 문의</span>
              <Inbox className="w-5 h-5 text-brand-green-primary" />
            </div>
            <div className="text-3xl font-medium">{stats.monthInquiries}</div>
          </Link>
        )}
        <Link
          href="/admin/programs"
          className="bg-white p-5 rounded-xl border hover:shadow-md transition flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">카드뉴스</span>
            <BookOpen className="w-5 h-5 text-brand-green-primary" />
          </div>
          <div className="text-3xl font-medium">{stats.programs}</div>
        </Link>
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
              새 카드뉴스
            </Link>
          </Button>
          <Button asChild size="lg" className="flex-col gap-3 py-10 px-6 text-sm">
            <Link href="/admin/news/new" className="flex flex-col items-center gap-3">
              <Megaphone className="w-5 h-5" />
              새 회사 소식
            </Link>
          </Button>
          <Button asChild size="lg" className="flex-col gap-3 py-10 px-6 text-sm">
            <Link href="/admin/events/new" className="flex flex-col items-center gap-3">
              <Activity className="w-5 h-5" />
              새 진행 내역
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild size="lg" className="flex-col gap-3 py-10 px-6 text-sm">
              <Link href="/admin/inquiries" className="flex flex-col items-center gap-3">
                <Mail className="w-5 h-5" />
                문의 관리
              </Link>
            </Button>
          )}
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
            <h3 className="text-sm font-semibold text-gray-700 mb-2">카드뉴스</h3>
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
          {isAdmin && (
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
          )}
        </div>
      </div>
    </div>
  );
}

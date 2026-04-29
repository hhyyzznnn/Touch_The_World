import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ExternalLink, Bell, CheckCircle, Clock } from "lucide-react";

async function getG2BStats() {
  const [total, notified, today] = await Promise.all([
    prisma.g2BNotice.count(),
    prisma.g2BNotice.count({ where: { status: "notified" } }),
    prisma.g2BNotice.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);
  return { total, notified, today };
}

async function getG2BNotices(page: number) {
  const ITEMS_PER_PAGE = 20;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [items, total] = await Promise.all([
    prisma.g2BNotice.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.g2BNotice.count(),
  ]);

  return { items, totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)) };
}

export default async function G2BAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;

  const [stats, { items, totalPages }] = await Promise.all([
    getG2BStats(),
    getG2BNotices(currentPage),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">나라장터 입찰 공고</h1>
        <p className="text-sm text-gray-500">매일 오전 9시 자동 수집 · pjjttw@naver.com 으로 알림 발송</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Bell className="w-4 h-4 text-brand-green-primary" />
            누적 공고
          </div>
          <div className="text-3xl font-semibold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4 text-brand-green-primary" />
            알림 발송
          </div>
          <div className="text-3xl font-semibold">{stats.notified}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Clock className="w-4 h-4 text-brand-green-primary" />
            오늘 수집
          </div>
          <div className="text-3xl font-semibold">{stats.today}</div>
        </div>
      </div>

      {/* 공고 목록 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-[40%]">공고명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">발주기관</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">예산</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">마감일</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">수집일</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  수집된 공고가 없습니다.
                </td>
              </tr>
            )}
            {items.map((notice) => (
              <tr key={notice.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <a
                    href={notice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1 text-brand-green-primary hover:underline font-medium leading-snug"
                  >
                    <span className="line-clamp-2">{notice.title}</span>
                    <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                  </a>
                  {notice.matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {notice.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">{notice.agency}</td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {notice.budget
                    ? `${(Number(notice.budget) / 100_000_000).toFixed(1)}억`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {notice.deadline
                    ? format(new Date(notice.deadline), "MM/dd", { locale: ko })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {notice.status === "notified" ? (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      발송완료
                    </span>
                  ) : notice.status === "new" ? (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      신규
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {notice.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {format(new Date(notice.createdAt), "MM/dd HH:mm", { locale: ko })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`/admin/g2b?page=${page}`}
              className={`px-3 py-1.5 rounded border text-sm transition ${
                page === currentPage
                  ? "bg-brand-green-primary text-white border-brand-green-primary"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

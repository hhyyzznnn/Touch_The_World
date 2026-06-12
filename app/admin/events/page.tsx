import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Pagination } from "@/components/Pagination";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";

const ITEMS_PER_PAGE = 20;

async function getEvents(page: number = 1, q?: string) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where = q
    ? {
        OR: [
          { school: { name: { contains: q, mode: "insensitive" as const } } },
          { program: { title: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { school: true, program: true },
      orderBy: { date: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const { events, total, totalPages } = await getEvents(currentPage, params.q);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">진행 내역 관리</h1>
        <div className="flex items-center gap-2">
          <AdminSearchInput basePath="/admin/events" defaultQ={params.q} placeholder="학교명 또는 프로그램 검색…" />
          <Button asChild className="flex-shrink-0">
            <Link href="/admin/events/new">새 진행 내역 추가</Link>
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">총 {total}건</div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          {params.q ? `'${params.q}' 검색 결과가 없습니다.` : "등록된 진행 내역이 없습니다."}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학교</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">프로그램</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(event.date), "yyyy-MM-dd")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.school.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {event.program.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {event.studentCount != null ? `${event.studentCount}명` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {event.location || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/events/${event.id}/edit`}>수정</Link>
                          </Button>
                          <AdminDeleteButton
                            endpoint={`/api/admin/events/${event.id}`}
                            confirmMessage="이 진행 내역을 삭제할까요?"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/admin/events"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}

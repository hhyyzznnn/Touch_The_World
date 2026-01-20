import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Pagination } from "@/components/Pagination";

const ITEMS_PER_PAGE = 20;

async function getEvents(page: number = 1) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      include: {
        school: true,
        program: true,
      },
      orderBy: { date: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.event.count(),
  ]);
  
  return {
    events,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  };
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const { events, totalPages } = await getEvents(currentPage);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">진행 내역 관리</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/events/new">새 진행 내역 추가</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          등록된 진행 내역이 없습니다.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    학교
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상품
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    학생수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(event.date), "yyyy-MM-dd")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.school.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.program.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.studentCount}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/events/${event.id}/edit`}>수정</Link>
                        </Button>
                        <form
                          action={`/api/admin/events/${event.id}`}
                          method="DELETE"
                        >
                          <Button type="submit" variant="destructive" size="sm">
                            삭제
                          </Button>
                        </form>
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


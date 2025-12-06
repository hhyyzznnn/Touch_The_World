import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

async function getEvents() {
  return await prisma.event.findMany({
    include: {
      school: true,
      program: true,
    },
    orderBy: { date: "desc" },
  });
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">진행 내역 관리</h1>
        <Button asChild>
          <Link href="/admin/events/new">새 진행 내역 추가</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 진행 내역이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
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
      )}
    </div>
  );
}


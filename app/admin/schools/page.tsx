import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getSchools() {
  return await prisma.school.findMany({
    include: {
      _count: {
        select: { events: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminSchoolsPage() {
  const schools = await getSchools();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">학교 관리</h1>
        <Button asChild>
          <Link href="/admin/schools/new">새 학교 추가</Link>
        </Button>
      </div>

      {schools.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 학교가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  학교명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  행사 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schools.map((school) => (
                <tr key={school.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {school.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {school._count.events}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/schools/${school.id}/edit`}>
                          수정
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/school/${school.id}`} target="_blank">
                          보기
                        </Link>
                      </Button>
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


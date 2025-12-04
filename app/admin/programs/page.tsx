import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getPrograms() {
  return await prisma.program.findMany({
    include: {
      images: {
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminProgramsPage() {
  const programs = await getPrograms();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">프로그램 관리</h1>
        <Button asChild>
          <Link href="/admin/programs/new">새 프로그램 추가</Link>
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 프로그램이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  이미지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programs.map((program) => (
                <tr key={program.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{program.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{program.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {program.images.length}개
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/programs/${program.id}/edit`}>
                          수정
                        </Link>
                      </Button>
                      <form
                        action={`/api/admin/programs/${program.id}`}
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


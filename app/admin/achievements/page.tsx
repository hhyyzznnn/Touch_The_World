import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getAchievements() {
  return await prisma.achievement.findMany({
    orderBy: [{ year: "desc" }, { institution: "asc" }],
  });
}

export default async function AdminAchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">사업 실적 관리</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/achievements/new">새 실적 추가</Link>
        </Button>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 실적이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  기관
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  연도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {achievements.map((achievement) => (
                <tr key={achievement.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {achievement.institution}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {achievement.year}년
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md truncate">{achievement.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/achievements/${achievement.id}/edit`}>
                          수정
                        </Link>
                      </Button>
                      <form
                        action={`/api/admin/achievements/${achievement.id}`}
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
      )}
    </div>
  );
}


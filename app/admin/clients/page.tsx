import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getClients() {
  return await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminClientsPage() {
  const clients = await getClients();

  const typeLabels: Record<string, string> = {
    public: "공공·교육기관",
    university: "대학교",
    highschool: "고등학교",
    corporation: "기업·단체",
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">고객사 관리</h1>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/clients/new">새 고객사 추가</Link>
          </Button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12 text-text-gray">
            등록된 고객사가 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    기관명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    국가
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {typeLabels[client.type] || client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{client.country}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 items-center justify-center">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/clients/${client.id}/edit`}>
                            수정
                          </Link>
                        </Button>
                        <form
                          action={`/api/admin/clients/${client.id}`}
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


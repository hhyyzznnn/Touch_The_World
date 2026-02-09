import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NewsDeleteButton } from "./NewsDeleteButton";
import { format } from "date-fns";

async function getNews() {
  return await prisma.companyNews.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminNewsPage() {
  const list = await getNews();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">회사 소식</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/news/new">새 소식 추가</Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 소식이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    메인 노출
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <span className="font-medium">{item.title}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isPinned ? (
                        <span className="text-brand-green-primary font-medium">노출</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {format(new Date(item.createdAt), "yyyy.MM.dd")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/news/${item.id}/edit`}>수정</Link>
                        </Button>
                        <NewsDeleteButton id={item.id} />
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

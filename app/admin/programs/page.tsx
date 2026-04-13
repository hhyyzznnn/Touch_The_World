import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";
import { format } from "date-fns";
import Image from "next/image";

async function getCardNews() {
  return await prisma.companyNews.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export default async function AdminProgramsPage() {
  const list = await getCardNews();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">프로그램 카드뉴스 관리</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/programs/new">새 카드뉴스 추가</Link>
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          등록된 카드뉴스가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이미지</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">메인 노출</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      {item.imageUrl ? (
                        <div className="relative w-16 h-20 rounded-md overflow-hidden border bg-gray-100">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
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
                          <Link href={`/admin/programs/${item.id}/edit`}>수정</Link>
                        </Button>
                        <AdminDeleteButton
                          endpoint={`/api/admin/news/${item.id}`}
                          confirmMessage="이 카드뉴스를 삭제할까요?"
                        />
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

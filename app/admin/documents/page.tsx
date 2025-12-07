import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

async function getDocuments() {
  return await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminDocumentsPage() {
  const documents = await getDocuments();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">자료실 관리</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/documents/new">새 자료 추가</Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 자료가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  카테고리
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
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {document.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {document.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(document.createdAt), "yyyy-MM-dd")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        다운로드
                      </a>
                      <form
                        action={`/api/admin/documents/${document.id}`}
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


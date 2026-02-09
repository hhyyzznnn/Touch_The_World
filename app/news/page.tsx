import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = {
  title: "회사 소식 - Touch The World",
  description: "터치더월드의 새로운 소식과 중요한 공지입니다.",
};

async function getNews() {
  return await prisma.companyNews.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export default async function NewsPage() {
  const list = await getNews();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-text-dark mb-6">회사 소식</h1>

        {list.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-text-gray">
            등록된 소식이 없습니다.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-20 sm:w-24">
                      분류
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      제목
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-24 sm:w-28">
                      작성일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map((item) => {
                    const href = item.link?.trim() || `/news/${item.id}`;
                    const isExternal = !!item.link?.trim()?.startsWith("http");
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {item.isPinned && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-brand-green-primary text-white">
                              공지
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="text-text-dark hover:text-brand-green-primary hover:underline underline-offset-2"
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-gray whitespace-nowrap">
                          {format(new Date(item.createdAt), "yyyy.MM.dd")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import { CompanyNewsType } from "@prisma/client";

export const metadata: Metadata = {
  title: "회사 소식 | 터치더월드",
  description:
    "터치더월드의 수상 소식, 혜택 안내, 모집 공고 등 최신 소식을 확인하세요.",
  alternates: {
    canonical: "/company-news",
  },
};

async function getCompanyNews() {
  return await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.COMPANY_NEWS },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      isPinned: true,
      createdAt: true,
    },
  });
}

export default async function CompanyNewsPage() {
  const list = await getCompanyNews();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark mb-2">회사 소식</h1>
        <p className="text-text-gray mb-8">수상 소식, 혜택 안내, 모집 공고 등 터치더월드의 최신 소식입니다.</p>

        {list.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-text-gray">
            등록된 소식이 없습니다.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-24 sm:w-28">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {list.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/news/${item.id}`}
                        className="flex items-center gap-2 text-text-dark hover:text-brand-green-primary hover:underline underline-offset-2"
                      >
                        {item.isPinned && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-brand-green-primary text-white flex-shrink-0">
                            공지
                          </span>
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-gray whitespace-nowrap">
                      {format(new Date(item.createdAt), "yyyy.MM.dd")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

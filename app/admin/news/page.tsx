import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NewsDeleteButton } from "./NewsDeleteButton";
import { format } from "date-fns";
import Image from "next/image";
import { CompanyNewsType } from "@prisma/client";

async function getNews(type?: CompanyNewsType) {
  return await prisma.companyNews.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

const TYPE_LABEL: Record<CompanyNewsType, string> = {
  COMPANY_NEWS: "회사 소식",
  PROGRAM_CARD_NEWS: "카드뉴스",
};

const TYPE_COLOR: Record<CompanyNewsType, string> = {
  COMPANY_NEWS: "bg-blue-100 text-blue-700",
  PROGRAM_CARD_NEWS: "bg-green-100 text-green-700",
};

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeFilter = params.type === "PROGRAM_CARD_NEWS"
    ? CompanyNewsType.PROGRAM_CARD_NEWS
    : params.type === "COMPANY_NEWS"
      ? CompanyNewsType.COMPANY_NEWS
      : undefined;

  const list = await getNews(typeFilter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">콘텐츠 관리</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/news/new">새 게시물 추가</Link>
        </Button>
      </div>

      {/* 타입 필터 탭 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { label: "전체", value: "" },
          { label: "회사 소식", value: "COMPANY_NEWS" },
          { label: "프로그램 카드뉴스", value: "PROGRAM_CARD_NEWS" },
        ].map(({ label, value }) => {
          const isActive = (params.type ?? "") === value;
          return (
            <Link
              key={value}
              href={value ? `/admin/news?type=${value}` : "/admin/news"}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-brand-green-primary text-brand-green-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 게시물이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    이미지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    제목 / 카테고리
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
                      {item.imageUrl ? (
                        <div className="relative w-12 h-16 rounded-md overflow-hidden border">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLOR[item.type]}`}>
                        {TYPE_LABEL[item.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium block">{item.title}</span>
                      {item.category && (
                        <span className="text-xs text-text-gray mt-0.5 block">{item.category}</span>
                      )}
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

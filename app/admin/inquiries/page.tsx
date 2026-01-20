import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { InquiryDetailModal } from "@/components/InquiryDetailModal";
import { InquiryActions } from "@/components/InquiryActions";
import { Pagination } from "@/components/Pagination";

const ITEMS_PER_PAGE = 20;

async function getInquiries(page: number = 1) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.inquiry.count(),
  ]);
  
  return {
    inquiries,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  };
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const { inquiries, totalPages } = await getInquiries(currentPage);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">문의 관리</h1>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          등록된 문의가 없습니다.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    학교명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    담당자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(inquiry.createdAt), "yyyy-MM-dd")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inquiry.schoolName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inquiry.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {inquiry.phone}
                      <br />
                      {inquiry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          inquiry.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {inquiry.status === "pending" ? "대기" : "완료"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <InquiryActions inquiry={inquiry} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/admin/inquiries"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}


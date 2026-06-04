import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { InquiryActions } from "@/components/inquiry/InquiryActions";
import { Pagination } from "@/components/Pagination";
import { getInquiryStatusMeta, INQUIRY_STATUS_VALUES } from "@/lib/inquiry-status";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

async function getInquiries(page: number, status?: string) {
  const where = status && INQUIRY_STATUS_VALUES.includes(status as never)
    ? { status }
    : undefined;

  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return { inquiries, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

async function getStatusCounts() {
  const counts = await prisma.inquiry.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const row of counts) map[row.status] = row._count._all;
  return map;
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const activeStatus = params.status ?? "";

  const [{ inquiries, total, totalPages }, statusCounts] = await Promise.all([
    getInquiries(currentPage, activeStatus || undefined),
    getStatusCounts(),
  ]);

  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const filterTabs = [
    { label: "전체", value: "", count: totalAll },
    ...INQUIRY_STATUS_VALUES.map((v) => ({
      label: getInquiryStatusMeta(v).label,
      value: v,
      count: statusCounts[v] ?? 0,
    })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">문의 관리</h1>
        <span className="text-sm text-gray-500">총 {total}건</span>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map((tab) => {
          const isActive = activeStatus === tab.value;
          const href = tab.value
            ? `/admin/inquiries?status=${tab.value}`
            : "/admin/inquiries";
          return (
            <Button
              key={tab.value}
              asChild
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={isActive ? "bg-brand-green-primary hover:bg-brand-green-primary/90" : ""}
            >
              <Link href={href}>
                {tab.label}
                <span className={`ml-1.5 text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
                  {tab.count}
                </span>
              </Link>
            </Button>
          );
        })}
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          해당하는 문의가 없습니다.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학교명</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당자</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inquiries.map((inquiry) => {
                    const statusMeta = getInquiryStatusMeta(inquiry.status);
                    return (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(inquiry.createdAt), "MM.dd HH:mm")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {inquiry.schoolName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {inquiry.contact}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{inquiry.phone || <span className="text-gray-400">전화 없음</span>}</div>
                          <div className="text-xs">{inquiry.email || <span className="text-gray-400">이메일 없음</span>}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusMeta.badgeClassName}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <InquiryActions inquiry={inquiry} />
                        </td>
                      </tr>
                    );
                  })}
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

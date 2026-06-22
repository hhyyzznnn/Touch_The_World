import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { InquiryActions } from "@/components/inquiry/InquiryActions";
import { AiSummaryBackfillButton } from "@/components/admin/AiSummaryBackfillButton";
import { Pagination } from "@/components/Pagination";
import { getInquiryStatusMeta, INQUIRY_STATUS_VALUES } from "@/lib/inquiry-status";
import { InquirySearchBar } from "@/components/admin/InquirySearchBar";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

const DOMESTIC_VALUES = ["서울/경기", "인천", "강원", "충청", "전라", "경상", "제주"];
const OVERSEAS_VALUES = ["일본", "동남아시아", "기타 해외"];

const SCHOOL_LEVEL_OPTIONS = [
  { label: "전체", value: "" },
  { label: "초등", value: "초등학교" },
  { label: "중학교", value: "중학교" },
  { label: "고등학교", value: "고등학교" },
  { label: "특성화고", value: "특성화고" },
  { label: "대학/기관", value: "대학교/기관" },
];

type SearchParams = {
  page?: string;
  status?: string;
  destType?: string;
  level?: string;
  sort?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
};

function buildWhere(
  status?: string,
  destType?: string,
  level?: string,
  q?: string,
  dateFrom?: string,
  dateTo?: string,
): Prisma.InquiryWhereInput | undefined {
  const conditions: Prisma.InquiryWhereInput[] = [];

  if (status && INQUIRY_STATUS_VALUES.includes(status as never)) {
    conditions.push({ status });
  }

  if (destType === "domestic") {
    conditions.push({ destination: { in: DOMESTIC_VALUES } });
  } else if (destType === "overseas") {
    conditions.push({ destination: { in: OVERSEAS_VALUES } });
  }

  if (level) {
    conditions.push({ schoolLevel: level });
  }

  if (q) {
    conditions.push({
      OR: [
        { schoolName: { contains: q, mode: "insensitive" } },
        { contact: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (dateFrom || dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    conditions.push({ createdAt });
  }

  return conditions.length > 0 ? { AND: conditions } : undefined;
}

async function getInquiries(params: SearchParams) {
  const page = params.page ? parseInt(params.page, 10) : 1;
  const where = buildWhere(params.status, params.destType, params.level, params.q, params.dateFrom, params.dateTo);
  const orderBy = { createdAt: params.sort === "asc" ? ("asc" as const) : ("desc" as const) };
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({ where, orderBy, skip, take: ITEMS_PER_PAGE }),
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

function buildFilterUrl(base: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...base, ...overrides, page: undefined };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return `/admin/inquiries${qs ? `?${qs}` : ""}`;
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeStatus = params.status ?? "";
  const activeDestType = params.destType ?? "";
  const activeLevel = params.level ?? "";
  const activeSort = params.sort ?? "desc";

  const [{ inquiries, total, totalPages }, statusCounts] = await Promise.all([
    getInquiries(params),
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
        <div className="flex items-center gap-3">
          <AiSummaryBackfillButton />
          <span className="text-sm text-gray-500">총 {total}건</span>
        </div>
      </div>

      {/* 검색 + 날짜 범위 */}
      <InquirySearchBar
        defaultQ={params.q}
        defaultDateFrom={params.dateFrom}
        defaultDateTo={params.dateTo}
      />

      {/* 상태 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filterTabs.map((tab) => {
          const isActive = activeStatus === tab.value;
          return (
            <Button
              key={tab.value}
              asChild
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={isActive ? "bg-brand-green-primary hover:bg-brand-green-primary/90" : ""}
            >
              <Link href={buildFilterUrl(params, { status: tab.value })}>
                {tab.label}
                <span className={`ml-1.5 text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
                  {tab.count}
                </span>
              </Link>
            </Button>
          );
        })}
      </div>

      {/* 2차 필터 — 목적지 유형 / 학교급 / 정렬 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs font-medium">목적지</span>
          {[
            { label: "전체", value: "" },
            { label: "국내", value: "domestic" },
            { label: "해외", value: "overseas" },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={buildFilterUrl(params, { destType: opt.value })}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                activeDestType === opt.value
                  ? "bg-brand-green-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs font-medium">학교급</span>
          {SCHOOL_LEVEL_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildFilterUrl(params, { level: opt.value })}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                activeLevel === opt.value
                  ? "bg-brand-green-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 text-xs font-medium">정렬</span>
          {[
            { label: "최신순", value: "desc" },
            { label: "오래된순", value: "asc" },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={buildFilterUrl(params, { sort: opt.value })}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                activeSort === opt.value
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          해당하는 문의가 없습니다.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학교명</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학교급</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">목적지</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당자</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inquiries.map((inquiry) => {
                    const statusMeta = getInquiryStatusMeta(inquiry.status);
                    const isOverseas = inquiry.destination
                      ? OVERSEAS_VALUES.includes(inquiry.destination)
                      : false;
                    return (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(inquiry.createdAt), "MM.dd HH:mm")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{inquiry.schoolName}</div>
                          {inquiry.aiSummary && (
                            <div className="mt-0.5 text-xs text-gray-400 line-clamp-1 max-w-[180px]" title={inquiry.aiSummary}>
                              {inquiry.aiSummary}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {inquiry.schoolLevel ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {inquiry.destination ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isOverseas
                                ? "bg-blue-50 text-blue-700"
                                : "bg-green-50 text-green-700"
                            }`}>
                              {isOverseas ? "🌏 " : "🇰🇷 "}{inquiry.destination}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {inquiry.contact}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{inquiry.phone || <span className="text-gray-400">전화 없음</span>}</div>
                          <div className="text-xs mt-0.5">{inquiry.email || <span className="text-gray-400">이메일 없음</span>}</div>
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
            currentPage={params.page ? parseInt(params.page, 10) : 1}
            totalPages={totalPages}
            baseUrl="/admin/inquiries"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}

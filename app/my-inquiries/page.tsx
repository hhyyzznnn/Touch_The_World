import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-user";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, Users, MapPin } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

async function getUserInquiries(userId: string) {
  return await prisma.inquiry.findMany({
    where: {
      email: {
        // 사용자 이메일로 문의 찾기 (실제로는 userId로 연결되어야 함)
        // 현재 스키마에는 userId가 없으므로 email로 매칭
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MyInquiriesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 사용자 이메일로 문의 찾기
  const inquiries = await prisma.inquiry.findMany({
    where: {
      email: user.email || "",
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          { label: "마이페이지", href: "/profile" },
          { label: "문의 내역" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">문의 내역</h1>
        <p className="text-text-gray">
          제출하신 문의 내역을 확인하실 수 있습니다.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-16 h-16 text-gray-300" />}
          title="문의 내역이 없습니다"
          description="새로운 문의를 제출해보세요."
          action={{
            label: "문의하기",
            href: "/inquiry",
          }}
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text-dark">
                      {inquiry.schoolName}
                    </h3>
                    <Badge
                      variant={inquiry.status === "pending" ? "default" : "secondary"}
                      className={
                        inquiry.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {inquiry.status === "pending" ? "대기 중" : "완료"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-gray">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{inquiry.contact}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(inquiry.createdAt), "yyyy년 MM월 dd일", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/inquiry/${inquiry.id}`}>상세 보기</Link>
                  </Button>
                </div>
              </div>

              {/* 문의 요약 정보 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                {inquiry.expectedDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-text-gray" />
                    <span className="text-text-gray">예상 일정:</span>
                    <span className="text-text-dark font-medium">
                      {inquiry.expectedDate}
                    </span>
                  </div>
                )}
                {inquiry.participantCount && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-text-gray" />
                    <span className="text-text-gray">예상 인원:</span>
                    <span className="text-text-dark font-medium">
                      {inquiry.participantCount}명
                    </span>
                  </div>
                )}
                {inquiry.preferredTransport && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-text-gray" />
                    <span className="text-text-gray">선호 이동수단:</span>
                    <span className="text-text-dark font-medium">
                      {inquiry.preferredTransport}
                    </span>
                  </div>
                )}
                {inquiry.estimatedBudget && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-gray">예상 예산:</span>
                    <span className="text-text-dark font-medium">
                      {inquiry.estimatedBudget.toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>

              {inquiry.message && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-text-gray line-clamp-2">
                    {inquiry.message}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

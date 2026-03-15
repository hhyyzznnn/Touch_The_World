import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-user";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Phone, User, Users, MapPin } from "lucide-react";
import { formatInquiryNumber, getInquiryStatusMeta } from "@/lib/inquiry-status";

export const metadata: Metadata = {
  title: "문의 상세 | 터치더월드",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const inquiry = await prisma.inquiry.findFirst({
    where:
      user.role === "admin"
        ? { id }
        : {
            id,
            OR: [{ userId: user.id }, ...(user.email ? [{ email: user.email }] : [])],
          },
  });

  if (!inquiry) {
    notFound();
  }
  const statusMeta = getInquiryStatusMeta(inquiry.status);

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          { label: "마이페이지", href: "/profile" },
          { label: "문의 내역", href: "/my-inquiries" },
          { label: "문의 상세" },
        ]}
      />

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-medium text-text-dark">문의 상세</h1>
          <Badge
            variant="outline"
            className={statusMeta.badgeClassName}
          >
            {statusMeta.label}
          </Badge>
        </div>
        <p className="mb-3 text-sm text-text-gray">
          접수번호: {formatInquiryNumber(inquiry.id)}
        </p>
        <p className="mb-6 rounded-md bg-gray-50 px-3 py-2 text-sm text-text-gray">
          {statusMeta.userGuide}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-gray" />
            <span className="text-text-gray">접수일:</span>
            <span className="text-text-dark font-medium">
              {format(new Date(inquiry.createdAt), "yyyy년 MM월 dd일", { locale: ko })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-text-gray" />
            <span className="text-text-gray">학교/기관:</span>
            <span className="text-text-dark font-medium">{inquiry.schoolName}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-text-gray" />
            <span className="text-text-gray">담당자:</span>
            <span className="text-text-dark font-medium">{inquiry.contact}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-text-gray" />
            <span className="text-text-gray">연락처:</span>
            <span className="text-text-dark font-medium">{inquiry.phone}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Mail className="w-4 h-4 text-text-gray" />
            <span className="text-text-gray">이메일:</span>
            <span className="text-text-dark font-medium">{inquiry.email}</span>
          </div>
          {inquiry.expectedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-gray" />
              <span className="text-text-gray">예상 일정:</span>
              <span className="text-text-dark font-medium">{inquiry.expectedDate}</span>
            </div>
          )}
          {inquiry.participantCount && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-text-gray" />
              <span className="text-text-gray">예상 인원:</span>
              <span className="text-text-dark font-medium">{inquiry.participantCount}명</span>
            </div>
          )}
          {inquiry.preferredTransport && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-text-gray" />
              <span className="text-text-gray">선호 이동수단:</span>
              <span className="text-text-dark font-medium">{inquiry.preferredTransport}</span>
            </div>
          )}
          {inquiry.estimatedBudget && (
            <div className="flex items-center gap-2">
              <span className="text-text-gray">예상 예산:</span>
              <span className="text-text-dark font-medium">
                {inquiry.estimatedBudget.toLocaleString()}원
              </span>
            </div>
          )}
        </div>

        {inquiry.purpose && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h2 className="text-base font-medium text-text-dark mb-2">여행 목적/성격</h2>
            <p className="text-sm text-text-gray whitespace-pre-wrap">{inquiry.purpose}</p>
          </div>
        )}

        {inquiry.specialRequests && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h2 className="text-base font-medium text-text-dark mb-2">특별 요구사항</h2>
            <p className="text-sm text-text-gray whitespace-pre-wrap">{inquiry.specialRequests}</p>
          </div>
        )}

        {inquiry.message && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h2 className="text-base font-medium text-text-dark mb-2">기타 문의 내용</h2>
            <p className="text-sm text-text-gray whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        )}

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/my-inquiries">목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

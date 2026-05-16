import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { COMPANY_INFO } from "@/lib/constants";
import { PrintTrigger } from "@/components/programs/PrintTrigger";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "프로그램 견적서 | 터치더월드",
  robots: { index: false, follow: false },
};

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*]\s+/gm, "• ")
    .trim();
}

export default async function ProgramQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await prisma.program.findUnique({
    where: { id },
    include: { schedules: { orderBy: { day: "asc" } } },
  });

  if (!program) notFound();

  const today = format(new Date(), "yyyy년 MM월 dd일", { locale: ko });
  const categoryName = getCategoryDisplayName(program.category);
  const plainDesc = program.description ? stripMarkdown(program.description) : null;

  return (
    <>
      {/* 화면 전용 컨트롤 바 — 인쇄 시 숨김 */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
        <Link
          href={`/programs/${id}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          프로그램으로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400 hidden sm:block">
            인쇄 대화상자에서 &apos;PDF로 저장&apos;을 선택하면 파일로 저장됩니다.
          </p>
          <PrintTrigger />
        </div>
      </div>

      {/* 견적서 본문 */}
      <div className="bg-gray-100 print:bg-white min-h-screen py-10 print:py-0 px-4 print:px-0">
        <div className="max-w-[794px] mx-auto bg-white shadow-lg print:shadow-none px-12 py-14 print:px-[50px] print:py-[50px]">

          {/* ── 헤더 ── */}
          <div className="flex justify-between items-start pb-5 mb-8 border-b-2 border-gray-800">
            <div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">터치더월드</div>
              <div className="text-sm text-gray-500 mt-0.5">교육여행·체험학습·AI 교육 프로그램 전문</div>
            </div>
            <div className="text-right text-xs text-gray-500 leading-relaxed">
              <div>Tel. {COMPANY_INFO.phone}</div>
              <div>{COMPANY_INFO.email}</div>
              <div className="mt-1 text-gray-400">Since 1996</div>
            </div>
          </div>

          {/* ── 제목 ── */}
          <div className="text-center mb-9">
            <h1 className="text-xl font-bold text-gray-900 tracking-wide">프 로 그 램 견 적 안 내</h1>
            <p className="text-xs text-gray-400 mt-2">{today} 기준</p>
          </div>

          {/* ── 기본 정보 테이블 ── */}
          <table className="w-full border-collapse text-sm mb-8">
            <tbody>
              <tr>
                <td className="border border-gray-200 bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap w-28">
                  프로그램명
                </td>
                <td className="border border-gray-200 px-4 py-2.5 text-gray-900 font-medium">
                  {program.title}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 bg-gray-50 px-4 py-2.5 font-medium text-gray-700">
                  분&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;류
                </td>
                <td className="border border-gray-200 px-4 py-2.5 text-gray-900">
                  {categoryName}
                </td>
              </tr>
              {program.summary && (
                <tr>
                  <td className="border border-gray-200 bg-gray-50 px-4 py-2.5 font-medium text-gray-700">
                    개&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;요
                  </td>
                  <td className="border border-gray-200 px-4 py-2.5 text-gray-700 leading-relaxed">
                    {program.summary}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── 프로그램 소개 ── */}
          {plainDesc && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-200">
                프로그램 소개
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {plainDesc.length > 900 ? plainDesc.slice(0, 900) + "…" : plainDesc}
              </p>
            </div>
          )}

          {/* ── 일정표 ── */}
          {program.schedules.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-200">
                일&nbsp;&nbsp;정&nbsp;&nbsp;표
              </h2>
              <div className="space-y-2">
                {program.schedules.map((schedule) => (
                  <div key={schedule.id} className="flex gap-4 text-sm">
                    <div className="shrink-0 w-12 font-medium text-gray-700 text-right">
                      {schedule.day}일차
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {schedule.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 안내 사항 ── */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-8 text-xs text-gray-600 leading-relaxed">
            <p className="font-semibold mb-1.5 text-gray-700">안내 사항</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>본 견적 안내는 참고용이며, 실제 비용은 인원·일정·요구사항에 따라 달라질 수 있습니다.</li>
              <li>정확한 견적은 아래 연락처로 문의해 주시기 바랍니다.</li>
              <li>학교 및 지자체 단체 할인이 적용될 수 있습니다.</li>
            </ul>
          </div>

          {/* ── 푸터 ── */}
          <div className="border-t-2 border-gray-800 pt-4">
            <div className="flex justify-between items-end text-xs text-gray-600">
              <div className="leading-relaxed">
                <p className="font-semibold text-sm text-gray-800 mb-0.5">주식회사 터치더월드</p>
                <p>{COMPANY_INFO.address}</p>
                <p>Tel. {COMPANY_INFO.phone}&nbsp;&nbsp;|&nbsp;&nbsp;{COMPANY_INFO.email}</p>
              </div>
              <div className="text-right text-gray-400">
                <p>발행일: {today}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

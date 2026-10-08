import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { formatInquiryNumber, getInquiryStatusMeta } from "@/lib/inquiry-status";

const NOT_FOUND_MESSAGE = "접수번호 또는 연락처가 일치하는 문의를 찾지 못했습니다. 입력 내용을 다시 확인해주세요.";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

/**
 * 비회원 문의 진행 상황 조회.
 * 접수번호만으로는 조회할 수 없고, 접수할 때 남긴 전화번호나 이메일이 함께 맞아야 한다.
 * 응답에는 진행 상태만 담고 문의 내용·연락처 같은 개인정보는 내려주지 않는다.
 */
export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(`inquiry-lookup:${getClientIP(request)}`, 10, 10 * 60 * 1000);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const body = await request.json().catch(() => null);
  const code = String(body?.inquiryNumber ?? "")
    .trim()
    .replace(/^INQ-?/i, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  const contact = String(body?.contact ?? "").trim();

  if (code.length < 10 || !contact) {
    return NextResponse.json({ error: "접수번호와 접수 시 입력한 연락처를 모두 입력해주세요." }, { status: 400 });
  }

  const candidates = await prisma.inquiry.findMany({
    where: { id: { startsWith: code.slice(0, 10).toLowerCase() } },
    select: { id: true, status: true, createdAt: true, schoolName: true, phone: true, email: true },
    take: 5,
  });

  const contactDigits = digitsOnly(contact);
  const inquiry = candidates.find(
    (item) =>
      formatInquiryNumber(item.id) === `INQ-${code.slice(0, 10).toUpperCase()}` &&
      ((contactDigits.length >= 9 && digitsOnly(item.phone) === contactDigits) ||
        (item.email !== "" && item.email.toLowerCase() === contact.toLowerCase()))
  );

  if (!inquiry) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  const meta = getInquiryStatusMeta(inquiry.status);
  return NextResponse.json({
    inquiryNumber: formatInquiryNumber(inquiry.id),
    status: inquiry.status,
    statusLabel: meta.label,
    guide: meta.userGuide,
    schoolName: inquiry.schoolName,
    createdAt: inquiry.createdAt.toISOString(),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { MANUAL_RECORD_SOURCES } from "@/lib/inquiry-source";

/**
 * 전화·카톡 등으로 받은 문의를 관리자가 직접 기록 (2026-11-27).
 * 홈페이지 폼만 세면 실제 문의가 빠져 보여, 채널별로 함께 세기 위한 기록이다. 알림 메일은 보내지 않는다.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  const b = await request.json().catch(() => null);
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const source = str(b?.source, 20);
  if (!(MANUAL_RECORD_SOURCES as readonly string[]).includes(source)) {
    return NextResponse.json({ error: "문의 채널을 골라 주세요." }, { status: 400 });
  }
  const schoolName = str(b?.schoolName, 100);
  if (!schoolName) return NextResponse.json({ error: "학교(기관)명을 입력해 주세요." }, { status: 400 });

  const receivedAt = str(b?.receivedAt, 10);
  const createdAt = /^\d{4}-\d{2}-\d{2}$/.test(receivedAt) ? new Date(`${receivedAt}T09:00:00+09:00`) : new Date();
  const participants = Number(b?.participantCount);

  const inquiry = await prisma.inquiry.create({
    data: {
      sourceType: source,
      schoolName,
      contact: str(b?.contact, 50) || "(미입력)",
      phone: str(b?.phone, 20),
      email: str(b?.email, 100),
      destination: str(b?.destination, 50) || null,
      participantCount: Number.isFinite(participants) && participants > 0 ? Math.round(participants) : null,
      message: str(b?.message, 2000) || null,
      createdAt,
      // 이미 통화·채팅으로 응대한 문의라 '24시간 미확인' 리마인더 대상에서 뺀다
      reminderSentAt: new Date(),
    },
    select: { id: true },
  });
  return NextResponse.json({ id: inquiry.id });
}

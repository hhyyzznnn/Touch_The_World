import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth-user";
import { MEMBERSHIP_ENTRY_POINTS, parseEntryPoint, parseMembershipInput } from "@/lib/membership";
import { classifyTouch, sanitizeAttribution } from "@/lib/attribution";
import { sendMembershipNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(`membership:${getClientIP(request)}`, 5, 60 * 1000);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const body = await request.json().catch(() => null);
  const parsed = parseMembershipInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;

  const now = new Date();
  const user = await getCurrentUser().catch(() => null);
  const raw = body as Record<string, unknown>;
  const via = parseEntryPoint(raw.via);
  const touches = sanitizeAttribution(raw.attribution);
  // 외부 유입(first/last) + 사이트 안 진입 자리(via)를 함께 저장
  const attribution = touches || via ? ({ ...(touches ?? {}), ...(via ? { via } : {}) } as Prisma.InputJsonObject) : null;
  const existing = await prisma.membershipMember.findUnique({ where: { email: data.email }, select: { id: true, newsletterOptIn: true } });

  // 같은 이메일로 다시 가입하면 새로 만들지 않고 최신 정보로 갱신한다.
  const fields = {
    name: data.name,
    schoolName: data.schoolName,
    position: data.position,
    schoolLevel: data.schoolLevel,
    phone: data.phone,
    interests: data.interests,
    pilotInterest: data.pilotInterest,
    newsletterOptIn: data.newsletterOptIn,
    privacyConsentAt: now,
    ...(data.newsletterOptIn && !existing?.newsletterOptIn ? { newsletterOptInAt: now } : {}),
    ...(user?.id ? { userId: user.id } : {}),
  };

  if (existing) {
    await prisma.membershipMember.update({ where: { id: existing.id }, data: fields });
  } else {
    await prisma.membershipMember.create({
      data: { ...fields, email: data.email, ...(attribution ? { attribution } : {}) },
    });
  }

  // 관리자 알림 — 메일이 실패해도 가입은 성공으로 둔다
  const source = [via ? MEMBERSHIP_ENTRY_POINTS[via] : null, touches ? classifyTouch(touches.first ?? touches.last) : null]
    .filter(Boolean)
    .join(" · ");
  await sendMembershipNotificationEmail({ ...data, source: source || null, updated: !!existing }).catch((error) =>
    console.error("멤버십 알림 메일 실패:", error)
  );

  return NextResponse.json({ ok: true, updated: !!existing });
}

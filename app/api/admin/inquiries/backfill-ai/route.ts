import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { generateInquirySummary } from "@/lib/inquiry-ai";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await prisma.inquiry.findMany({
    where: { aiSummary: null },
    select: {
      id: true,
      schoolName: true,
      destination: true,
      schoolLevel: true,
      participantCount: true,
      expectedDate: true,
      purpose: true,
      estimatedBudget: true,
      hasInstructor: true,
      preferredTransport: true,
      accommodation: true,
      message: true,
      specialRequests: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let updated = 0;
  let skipped = 0;

  for (const inquiry of inquiries) {
    const aiSummary = await generateInquirySummary(inquiry);
    if (aiSummary) {
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { aiSummary },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ success: true, updated, skipped, total: inquiries.length });
}

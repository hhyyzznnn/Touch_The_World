import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inquirySchema = z.object({
  schoolName: z.string().min(1),
  contact: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inquirySchema.parse(body);

    const inquiry = await prisma.inquiry.create({
      data: {
        schoolName: data.schoolName,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        message: data.message || null,
      },
    });

    // TODO: 이메일 알림 기능 추가

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "입력 데이터가 올바르지 않습니다.", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Inquiry creation error:", error);
    return NextResponse.json(
      { error: "문의 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}


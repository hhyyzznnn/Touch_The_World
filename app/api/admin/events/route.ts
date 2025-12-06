import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      schoolName,
      schoolId,
      programId,
      programName,
      date,
      endDate,
      location,
      studentCount,
      content,
      status,
      imageUrls,
    } = body;

    // 학교 찾기 또는 생성
    let finalSchoolId = schoolId;
    if (schoolName && !schoolId) {
      const school = await prisma.school.upsert({
        where: { name: schoolName },
        update: {},
        create: { name: schoolName },
      });
      finalSchoolId = school.id;
    }

    // 프로그램 찾기 또는 생성
    let finalProgramId = programId;
    if (programName && !programId) {
      // 기본 카테고리로 프로그램 생성
      const program = await prisma.program.create({
        data: {
          title: programName,
          category: "기타",
        },
      });
      finalProgramId = program.id;
    }

    const event = await prisma.event.create({
      data: {
        schoolId: finalSchoolId,
        programId: finalProgramId,
        date: new Date(date),
        location: location || "",
        studentCount: studentCount ? parseInt(studentCount) : 0,
        status: status || "in_progress",
        notes: endDate 
          ? `${content || ""}\n기간: ${date} ~ ${endDate}`.trim()
          : content || null,
        images: {
          create: imageUrls?.map((url: string) => ({ url })) || [],
        },
      },
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "진행 내역 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

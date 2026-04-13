import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, apiError, apiSuccess, parseRequestBody } from "@/lib/api-helpers";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

function parseBoolean(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

async function handleQuickCreate(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  let title = "";
  let summary = "";
  let content = "";
  let link = "";
  let imageUrl = "";
  let isPinned = false;
  let uploadedFile: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    title = String(formData.get("title") || "").trim();
    summary = String(formData.get("summary") || "").trim();
    content = String(formData.get("content") || "").trim();
    link = String(formData.get("link") || "").trim();
    imageUrl = String(formData.get("imageUrl") || "").trim();
    isPinned = parseBoolean(formData.get("isPinned"));

    const imageField = formData.get("image");
    if (imageField instanceof File && imageField.size > 0) {
      uploadedFile = imageField;
    }
  } else {
    const body = (await request.json()) as {
      title?: string;
      summary?: string;
      content?: string;
      link?: string;
      imageUrl?: string;
      isPinned?: boolean;
    };
    title = (body.title || "").trim();
    summary = (body.summary || "").trim();
    content = (body.content || "").trim();
    link = (body.link || "").trim();
    imageUrl = (body.imageUrl || "").trim();
    isPinned = Boolean(body.isPinned);
  }

  if (!title) {
    return NextResponse.json({ error: "title은 필수입니다." }, { status: 400 });
  }

  if (!uploadedFile && !imageUrl) {
    return NextResponse.json({ error: "image 파일 또는 imageUrl 중 하나는 필수입니다." }, { status: 400 });
  }

  if (uploadedFile) {
    if (!uploadedFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "image는 이미지 파일이어야 합니다." }, { status: 400 });
    }
    if (uploadedFile.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "image는 8MB 이하여야 합니다." }, { status: 400 });
    }

    const token = process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET;
    if (!token) {
      return NextResponse.json(
        { error: "UPLOADTHING_TOKEN 또는 UPLOADTHING_SECRET 환경 변수가 필요합니다." },
        { status: 500 }
      );
    }

    const utapi = new UTApi({ token });
    const result = await utapi.uploadFiles(uploadedFile);
    if (!result.data) {
      const message = result.error?.message || "UploadThing 업로드에 실패했습니다.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    imageUrl = result.data.ufsUrl || result.data.url || result.data.appUrl;
  }

  const created = await prisma.companyNews.create({
    data: {
      title,
      summary: summary || null,
      content: content || null,
      link: link || null,
      imageUrl: imageUrl || null,
      isPinned,
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      isPinned: true,
      createdAt: true,
    },
  });

  return apiSuccess({ success: true, item: created });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireStaff();
  if (authError) return authError;

  try {
    const { id } = await params;
    if (id === "quick-create") {
      return await handleQuickCreate(request);
    }

    return NextResponse.json(
      { error: "POST는 /api/admin/programs/quick-create 엔드포인트를 사용하세요." },
      { status: 405 }
    );
  } catch (error) {
    return apiError("요청 처리에 실패했습니다.", 500, error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireStaff();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await parseRequestBody<{
      title: string;
      category: string;
      summary?: string;
      description?: string;
      schedules?: Array<{ day: number; description: string }>;
      imageUrls?: string[];
      thumbnailUrl?: string;
    }>(request);
    const { title, category, summary, description, schedules, imageUrls, thumbnailUrl } = body;

    const program = await prisma.$transaction(async (tx) => {
      await tx.programSchedule.deleteMany({
        where: { programId: id },
      });
      await tx.programImage.deleteMany({
        where: { programId: id },
      });

      return tx.program.update({
        where: { id },
        data: {
          title,
          category,
          summary: summary || null,
          description: description || null,
          thumbnailUrl: thumbnailUrl || null,
          schedules: {
            create: schedules?.map((s: { day: number; description: string }) => ({
              day: s.day,
              description: s.description,
            })) || [],
          },
          images: {
            create: imageUrls?.map((url: string) => ({ url })) || [],
          },
        },
      });
    });

    return apiSuccess({ success: true, id: program.id });
  } catch (error) {
    return apiError("프로그램 수정에 실패했습니다.", 500, error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireStaff();
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.program.delete({
      where: { id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return apiError("프로그램 삭제에 실패했습니다.", 500, error);
  }
}

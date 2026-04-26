import { NextRequest, NextResponse } from "next/server";
import { requireStaff, apiError, apiSuccess } from "@/lib/api-helpers";
import { uploadPublicImage } from "@/lib/uploadthing-server";

export const runtime = "nodejs";

const IMAGE_FIELD_NAMES = ["image", "file", "images", "thumbnail", "cardNewsImage"];

function getImageFile(formData: FormData): File | null {
  for (const fieldName of IMAGE_FIELD_NAMES) {
    const value = formData.get(fieldName);
    if (value instanceof File && value.size > 0) {
      return value;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const image = getImageFile(formData);

    if (!image) {
      return NextResponse.json(
        { error: "image 또는 file 필드에 이미지 파일을 첨부하세요." },
        { status: 400 }
      );
    }

    const url = await uploadPublicImage(image);
    return apiSuccess({ success: true, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`카드뉴스 이미지 업로드에 실패했습니다: ${message}`, 500, error);
  }
}

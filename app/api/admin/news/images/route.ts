import { NextRequest } from "next/server";
import { requireStaff, apiError, apiSuccess } from "@/lib/api-helpers";
import { uploadPublicImage } from "@/lib/uploadthing-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return apiError("Content-Type은 multipart/form-data여야 합니다.", 400);
  }

  try {
    const formData = await request.formData();

    // field name: "image" (primary), fallback: "file"
    const imageField = formData.get("image") ?? formData.get("file");
    if (!(imageField instanceof File) || imageField.size === 0) {
      return apiError('필드명 "image"로 이미지 파일을 첨부하세요.', 400);
    }

    const url = await uploadPublicImage(imageField);

    return apiSuccess({
      success: true,
      url,
      filename: imageField.name,
      originalSize: imageField.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`이미지 업로드 실패: ${message}`, 500, error);
  }
}

import { NextRequest } from "next/server";
import { requireStaff, apiError, apiSuccess } from "@/lib/api-helpers";
import {
  uploadPublicImage,
  uploadPublicImageFromUrl,
  MAX_REQUEST_BODY_IMAGE_BYTES,
} from "@/lib/uploadthing-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    // ─── 방식 A: JSON { "url": "https://..." } ───────────────────────────
    // 서버가 직접 다운로드·압축·업로드 → Vercel body 한도 우회, 최대 20MB 지원
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const imageUrl: unknown = body?.url;

      if (typeof imageUrl !== "string" || !imageUrl.startsWith("https://")) {
        return apiError('"url" 필드에 HTTPS 이미지 URL을 전달하세요.', 400);
      }

      const url = await uploadPublicImageFromUrl(imageUrl);
      return apiSuccess({ success: true, url });
    }

    // ─── 방식 B: multipart/form-data { image: <File> } ───────────────────
    // 관리자 UI 또는 파일을 직접 보내는 경우, 최대 4MB
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const imageField = formData.get("image") ?? formData.get("file");

      if (!(imageField instanceof File) || imageField.size === 0) {
        return apiError('필드명 "image"로 이미지 파일을 첨부하세요.', 400);
      }

      if (imageField.size > MAX_REQUEST_BODY_IMAGE_BYTES) {
        const mb = (imageField.size / 1024 / 1024).toFixed(1);
        return apiError(
          `파일이 너무 큽니다. ${mb}MB (최대 ${MAX_REQUEST_BODY_IMAGE_BYTES / 1024 / 1024}MB). URL 방식을 사용하세요.`,
          400
        );
      }

      const url = await uploadPublicImage(imageField);
      return apiSuccess({ success: true, url, filename: imageField.name });
    }

    return apiError(
      'Content-Type은 application/json 또는 multipart/form-data여야 합니다.',
      400
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`이미지 업로드 실패: ${message}`, 500, error);
  }
}

import { NextRequest } from "next/server";
import { requireStaff, apiError, apiSuccess } from "@/lib/api-helpers";
import {
  uploadPublicImage,
  uploadPublicImageFromUrl,
  MAX_REQUEST_BODY_IMAGE_BYTES,
} from "@/lib/uploadthing-server";

export const runtime = "nodejs";

/**
 * POST /api/admin/card-news/images
 * 카드뉴스 이미지 단건 업로드 → UploadThing URL 반환
 *
 * 방식 A — multipart/form-data { image: File }
 *   파일을 직접 전송. 각 파일 최대 4MB.
 *   Vercel body 한도(4.5MB)로 인해 파일 1장씩 개별 요청 필요.
 *   Response: { success: true, url: "https://utfs.io/...", filename: "..." }
 *
 * 방식 B — application/json { "url": "https://..." }
 *   서버가 직접 다운로드·압축·업로드. 최대 20MB.
 *   Discord CDN URL을 알고 있을 때 사용.
 *   Response: { success: true, url: "https://utfs.io/..." }
 *
 * OpenClaw 권장 사용법 (로컬 파일):
 *   - 방식 A로 1장씩 업로드 → URL 수집 → POST /api/admin/card-news (JSON)
 */
export async function POST(request: NextRequest) {
  const authError = await requireStaff(request);
  if (authError) return authError;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const imageUrl: unknown = body?.url;

      if (typeof imageUrl !== "string" || !imageUrl.startsWith("https://")) {
        return apiError('"url" 필드에 HTTPS 이미지 URL을 전달하세요.', 400);
      }

      const url = await uploadPublicImageFromUrl(imageUrl);
      return apiSuccess({ success: true, url });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const imageField = formData.get("image") ?? formData.get("file");

      if (!(imageField instanceof File) || imageField.size === 0) {
        return apiError('필드명 "image"로 이미지 파일을 첨부하세요.', 400);
      }

      if (imageField.size > MAX_REQUEST_BODY_IMAGE_BYTES) {
        const mb = (imageField.size / 1024 / 1024).toFixed(1);
        return apiError(
          `파일이 너무 큽니다. ${mb}MB (최대 ${MAX_REQUEST_BODY_IMAGE_BYTES / 1024 / 1024}MB). 파일을 개별 전송하거나 URL 방식을 사용하세요.`,
          400
        );
      }

      const url = await uploadPublicImage(imageField);
      return apiSuccess({ success: true, url, filename: imageField.name });
    }

    return apiError(
      "Content-Type은 application/json 또는 multipart/form-data여야 합니다.",
      400
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return apiError(`이미지 업로드 실패: ${message}`, 500, error);
  }
}

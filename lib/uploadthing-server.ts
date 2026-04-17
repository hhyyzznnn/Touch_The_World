import { UTApi } from "uploadthing/server";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function getUploadThingToken(): string {
  const token = process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET;
  if (!token) {
    throw new Error("UPLOADTHING_TOKEN 또는 UPLOADTHING_SECRET 환경 변수가 필요합니다.");
  }
  return token;
}

export function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("이미지는 8MB 이하여야 합니다.");
  }
}

export async function uploadPublicImage(file: File): Promise<string> {
  validateImageFile(file);

  const utapi = new UTApi({ token: getUploadThingToken() });
  const result = await utapi.uploadFiles(file, {
    acl: "public-read",
  });

  if (!result.data) {
    throw new Error(result.error?.message || "UploadThing 업로드에 실패했습니다.");
  }

  return result.data.ufsUrl || result.data.url || result.data.appUrl;
}

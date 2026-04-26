import { UTApi } from "uploadthing/server";
import sharp from "sharp";

// Request body uploads are blocked by Vercel at ~4.5MB — keep under 4MB
export const MAX_REQUEST_BODY_IMAGE_BYTES = 4 * 1024 * 1024;
// Server-side URL fetch has no Vercel body limit — allow larger originals
const MAX_FETCH_IMAGE_BYTES = 20 * 1024 * 1024;

const MAX_COMPRESSED_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 80;

export function getUploadThingToken(): string {
  const token = process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET;
  if (!token) {
    throw new Error("UPLOADTHING_TOKEN 또는 UPLOADTHING_SECRET 환경 변수가 필요합니다.");
  }
  return token;
}

function checkImageMimeType(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
}

function getCompressedFileName(fileName: string): string {
  const safeBaseName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9가-힣._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${safeBaseName || "card-news"}.webp`;
}

async function compressImageFile(file: File): Promise<File> {
  checkImageMimeType(file);

  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input, {
    failOn: "none",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  if (output.byteLength > MAX_COMPRESSED_IMAGE_BYTES) {
    throw new Error(
      `압축 후에도 이미지가 너무 큽니다. ${file.name} (${Math.ceil(output.byteLength / 1024 / 1024)}MB). 원본 해상도를 줄여주세요.`
    );
  }

  const arrayBuffer = output.buffer.slice(
    output.byteOffset,
    output.byteOffset + output.byteLength
  ) as ArrayBuffer;

  return new File([arrayBuffer], getCompressedFileName(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

async function uploadCompressed(file: File): Promise<string> {
  const compressed = await compressImageFile(file);
  const utapi = new UTApi({ token: getUploadThingToken() });
  const result = await utapi.uploadFiles(compressed, { acl: "public-read" });

  if (!result.data) {
    throw new Error(result.error?.message || "UploadThing 업로드에 실패했습니다.");
  }

  const url = result.data.ufsUrl || result.data.url || result.data.appUrl;
  if (!url) {
    throw new Error("UploadThing에서 URL을 받지 못했습니다.");
  }
  return url;
}

/** 요청 body로 직접 전달된 File 업로드 (최대 4MB) */
export async function uploadPublicImage(file: File): Promise<string> {
  return uploadCompressed(file);
}

/** 외부 URL에서 서버가 직접 다운로드 후 압축·업로드 (최대 20MB) */
export async function uploadPublicImageFromUrl(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`이미지 URL 다운로드 실패: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`URL이 이미지를 가리키지 않습니다. (Content-Type: ${contentType})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_FETCH_IMAGE_BYTES) {
    throw new Error(
      `이미지가 너무 큽니다. ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)}MB (최대 ${MAX_FETCH_IMAGE_BYTES / 1024 / 1024}MB)`
    );
  }

  const filename = imageUrl.split("/").pop()?.split("?")[0] || "image.jpg";
  const file = new File([arrayBuffer], filename, { type: contentType });

  return uploadCompressed(file);
}

export async function uploadPublicImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadPublicImage(file));
  }
  return urls;
}

import { UTApi } from "uploadthing/server";
import sharp from "sharp";

// Vercel serverless body limit is ~4.5MB — keep input under 4MB for safety
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
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

export function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(
      `이미지가 너무 큽니다. ${sizeMB}MB (최대 ${MAX_IMAGE_BYTES / 1024 / 1024}MB). 업로드 전 이미지를 압축해주세요.`
    );
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
  validateImageFile(file);

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
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
    })
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

export async function uploadPublicImage(file: File): Promise<string> {
  const uploadFile = await compressImageFile(file);

  const utapi = new UTApi({ token: getUploadThingToken() });
  const result = await utapi.uploadFiles(uploadFile, {
    acl: "public-read",
  });

  if (!result.data) {
    throw new Error(result.error?.message || "UploadThing 업로드에 실패했습니다.");
  }

  // ufsUrl is the canonical public CDN URL in UploadThing v7
  const url = result.data.ufsUrl || result.data.url || result.data.appUrl;
  if (!url) {
    throw new Error("UploadThing에서 URL을 받지 못했습니다.");
  }
  return url;
}

export async function uploadPublicImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadPublicImage(file));
  }
  return urls;
}

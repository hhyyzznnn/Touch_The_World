import type { NextRequest } from "next/server";
import { uploadPublicImages } from "@/lib/uploadthing-server";
import { parseRequestBody } from "@/lib/api-helpers";
import { CompanyNewsType } from "@prisma/client";

export { CompanyNewsType };

export const PROGRAM_CATEGORIES = [
  "국내수학여행",
  "국내외교육여행",
  "체험학습",
  "수련활동",
  "교사연수",
  "해외취업및유학",
  "지자체및대학RISE사업",
  "특성화고교프로그램",
  "기타프로그램",
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

const IMAGE_FIELD_NAMES = ["images", "image", "file", "thumbnail", "cardNewsImage"];

export interface AdminNewsRequestData {
  type: CompanyNewsType;
  category: string | null;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageUrls: string[];
  link: string;
  isPinned: boolean;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

function parseType(value: unknown): CompanyNewsType {
  if (value === "PROGRAM_CARD_NEWS") return CompanyNewsType.PROGRAM_CARD_NEWS;
  return CompanyNewsType.COMPANY_NEWS;
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getUploadedImages(formData: FormData): File[] {
  const files: File[] = [];

  for (const fieldName of IMAGE_FIELD_NAMES) {
    for (const value of formData.getAll(fieldName)) {
      if (value instanceof File && value.size > 0) {
        files.push(value);
      }
    }
  }

  return files;
}

export async function parseAdminNewsRequest(request: NextRequest): Promise<AdminNewsRequestData> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    let imageUrl = String(formData.get("imageUrl") || "").trim();
    const imageUrls = [
      ...formData
        .getAll("imageUrls")
        .flatMap((value) => normalizeStringList(value)),
      ...formData
        .getAll("imageUrls[]")
        .flatMap((value) => normalizeStringList(value)),
    ];
    const uploadedImages = getUploadedImages(formData);

    if (uploadedImages.length > 0) {
      imageUrls.push(...await uploadPublicImages(uploadedImages));
    }

    if (!imageUrl && imageUrls.length > 0) {
      imageUrl = imageUrls[0];
    }

    const type = parseType(formData.get("type"));
    const category = type === CompanyNewsType.PROGRAM_CARD_NEWS
      ? String(formData.get("category") || "").trim() || null
      : null;

    return {
      type,
      category,
      title: String(formData.get("title") || "").trim(),
      summary: String(formData.get("summary") || "").trim(),
      content: String(formData.get("content") || "").trim(),
      imageUrl,
      imageUrls: imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
      link: String(formData.get("link") || "").trim(),
      isPinned: parseBoolean(formData.get("isPinned")),
    };
  }

  const body = await parseRequestBody<{
    type?: string;
    category?: string | null;
    title: string;
    summary?: string;
    content?: string;
    imageUrl?: string | null;
    imageUrls?: string[];
    link?: string;
    isPinned?: boolean;
  }>(request);
  const imageUrls = normalizeStringList(body.imageUrls);
  const imageUrl = body.imageUrl?.trim() || imageUrls[0] || "";
  const type = parseType(body.type);
  const category = type === CompanyNewsType.PROGRAM_CARD_NEWS
    ? body.category?.trim() || null
    : null;

  return {
    type,
    category,
    title: body.title?.trim() || "",
    summary: body.summary?.trim() || "",
    content: body.content?.trim() || "",
    imageUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
    link: body.link?.trim() || "",
    isPinned: Boolean(body.isPinned),
  };
}

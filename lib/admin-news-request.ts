import type { NextRequest } from "next/server";
import { uploadPublicImage } from "@/lib/uploadthing-server";
import { parseRequestBody } from "@/lib/api-helpers";

const IMAGE_FIELD_NAMES = ["image", "file", "thumbnail", "cardNewsImage"];

export interface AdminNewsRequestData {
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  link: string;
  isPinned: boolean;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

function getUploadedImage(formData: FormData): File | null {
  for (const fieldName of IMAGE_FIELD_NAMES) {
    const value = formData.get(fieldName);
    if (value instanceof File && value.size > 0) {
      return value;
    }
  }

  return null;
}

export async function parseAdminNewsRequest(request: NextRequest): Promise<AdminNewsRequestData> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    let imageUrl = String(formData.get("imageUrl") || "").trim();
    const uploadedImage = getUploadedImage(formData);

    if (uploadedImage) {
      imageUrl = await uploadPublicImage(uploadedImage);
    }

    return {
      title: String(formData.get("title") || "").trim(),
      summary: String(formData.get("summary") || "").trim(),
      content: String(formData.get("content") || "").trim(),
      imageUrl,
      link: String(formData.get("link") || "").trim(),
      isPinned: parseBoolean(formData.get("isPinned")),
    };
  }

  const body = await parseRequestBody<{
    title: string;
    summary?: string;
    content?: string;
    imageUrl?: string | null;
    link?: string;
    isPinned?: boolean;
  }>(request);

  return {
    title: body.title?.trim() || "",
    summary: body.summary?.trim() || "",
    content: body.content?.trim() || "",
    imageUrl: body.imageUrl?.trim() || "",
    link: body.link?.trim() || "",
    isPinned: Boolean(body.isPinned),
  };
}

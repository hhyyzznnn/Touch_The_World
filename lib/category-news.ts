import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

const FILE_NAME_COLLATOR = new Intl.Collator("ko-KR", {
  numeric: true,
  sensitivity: "base",
});

export const CATEGORY_NEWS_FOLDER_MAP: Record<string, string> = {
  국내수학여행: "domestic-study-tour",
  국내외교육여행: "overseas-education-trip",
  체험학습: "experience-learning",
  수련활동: "retreat-activity",
  교사연수: "teacher-training",
  해외취업및유학: "overseas-career-study",
  지자체및대학RISE사업: "rise-project",
  특성화고교프로그램: "specialized-highschool",
  기타프로그램: "other-programs",
};

function isImageFile(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return IMAGE_EXTENSIONS.has(extension);
}

function toPublicImagePath(folderName: string, fileName: string) {
  return `/category-news/${folderName}/${encodeURIComponent(fileName)}`;
}

export function getCategoryNewsFolder(categoryKey: string): string | null {
  return CATEGORY_NEWS_FOLDER_MAP[categoryKey] || null;
}

export async function getCategoryNewsImages(categoryKey: string): Promise<string[]> {
  const folderName = getCategoryNewsFolder(categoryKey);
  if (!folderName) return [];

  const folderPath = path.join(process.cwd(), "public", "category-news", folderName);

  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && isImageFile(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => FILE_NAME_COLLATOR.compare(a, b));

    return files.map((fileName) => toPublicImagePath(folderName, fileName));
  } catch {
    return [];
  }
}

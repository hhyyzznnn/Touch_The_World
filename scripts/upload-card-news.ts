/**
 * 카드뉴스 이미지 업로드 스크립트
 *
 * 워크플로:
 *   1. public/company-news/<폴더명>/ 에 이미지 넣기
 *   2. 아래 NEWS_ITEMS 배열에 항목 추가 (Claude가 작성)
 *   3. npx tsx scripts/upload-card-news.ts 실행
 *   4. 생성된 scripts/sql/upload_YYYYMMDD.sql 을 Supabase SQL Editor에서 실행
 *   5. 로컬 이미지 폴더는 스크립트가 자동 삭제
 *
 * 필수 환경변수: UPLOADTHING_TOKEN
 */

import { config } from "dotenv";
config({ path: ".env" });

import { UTApi } from "uploadthing/server";
import { CompanyNewsType } from "@prisma/client";
import fs from "fs";
import path from "path";

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN! });

interface NewsItem {
  folder: string;               // public/company-news/폴더명
  id: string;                   // DB 고유 ID (cardnews_xxx_yyyy)
  type: CompanyNewsType;
  category: string;
  title: string;
  summary: string;
  content: string;
  hashtags: string[];
  link?: string;
  isPinned?: boolean;
  deleteLocalAfterUpload?: boolean;  // true면 업로드 후 로컬 폴더 삭제
}

// ─── 업로드 대기 목록 ───────────────────────────────────────────────────────
const NEWS_ITEMS: NewsItem[] = [
  // 새 카드뉴스를 여기에 추가하세요. 예시:
  // {
  //   folder: "public/company-news/새폴더이름",
  //   id: "cardnews_새폴더이름_2026",
  //   type: CompanyNewsType.PROGRAM_CARD_NEWS,
  //   category: "국내외 교육여행",
  //   title: "제목",
  //   summary: "한 줄 요약",
  //   content: `## 본문 마크다운`,
  //   hashtags: ["#국내", "#지역명"],
  //   deleteLocalAfterUpload: true,
  // },
];
// ─────────────────────────────────────────────────────────────────────────────

async function uploadFolder(folderPath: string): Promise<string[]> {
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  if (files.length === 0) throw new Error(`이미지 없음: ${folderPath}`);

  const urls: string[] = [];
  for (const filename of files) {
    const buffer = fs.readFileSync(path.join(folderPath, filename));
    const ext = path.extname(filename).slice(1).toLowerCase();
    const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const file = new File([buffer], filename, { type: mime });
    const result = await utapi.uploadFiles(file);
    if (result.error) throw new Error(`업로드 실패 (${filename}): ${result.error.message}`);
    urls.push(result.data.ufsUrl ?? result.data.url);
    process.stdout.write(".");
  }
  console.log(` ${files.length}장`);
  return urls;
}

function pgLiteral(value: string): string {
  // PostgreSQL dollar-quoting으로 이스케이프 없이 긴 문자열 처리
  return `$pgtag$${value}$pgtag$`;
}

function pgArray(arr: string[]): string {
  return `ARRAY[${arr.map((s) => `'${s.replace(/'/g, "''")}'`).join(", ")}]`;
}

async function main() {
  if (NEWS_ITEMS.length === 0) {
    console.log("NEWS_ITEMS가 비어 있습니다. 항목을 추가한 뒤 다시 실행하세요.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sqlPath = `scripts/sql/upload_${today}.sql`;
  const sqlLines: string[] = [`-- 카드뉴스 CDN 업로드 결과 (${today})\n`];

  for (const item of NEWS_ITEMS) {
    console.log(`\n▶ ${item.title}`);
    process.stdout.write("  이미지 업로드 중 ");

    const urls = await uploadFolder(path.resolve(item.folder));
    const [first] = urls;

    sqlLines.push(`-- ${item.title}`);
    sqlLines.push(`INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  '${item.id}',
  '${item.type}',
  '${item.category.replace(/'/g, "''")}',
  ${pgLiteral(item.title)},
  ${pgLiteral(item.summary)},
  ${pgLiteral(item.content)},
  '${first}',
  ${pgArray(urls)},
  ${item.link ? `'${item.link}'` : "NULL"},
  ${pgArray(item.hashtags)},
  ${item.isPinned ?? false},
  NOW(), NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = NOW();\n`);

    if (item.deleteLocalAfterUpload) {
      fs.rmSync(path.resolve(item.folder), { recursive: true, force: true });
      console.log(`  로컬 폴더 삭제 완료: ${item.folder}`);
    }
  }

  if (!fs.existsSync("scripts/sql")) fs.mkdirSync("scripts/sql", { recursive: true });
  fs.writeFileSync(sqlPath, sqlLines.join("\n"), "utf-8");
  console.log(`\n✅ SQL 생성 완료: ${sqlPath}`);
  console.log("→ Supabase SQL Editor에서 위 파일 내용을 실행하세요.");
}

main().catch((e) => {
  console.error("❌ 오류:", e);
  process.exit(1);
});

/**
 * 로컬 경로 카드뉴스 → UploadThing CDN 이관 스크립트
 * 실행: npx tsx scripts/migrate-local-to-cdn.ts
 */

import { config } from "dotenv";
config({ path: ".env" });

import { UTApi } from "uploadthing/server";
import fs from "fs";
import path from "path";

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN! });

const MIGRATE_ITEMS: { id: string; folder: string }[] = [
  // 예시: 아래에 이관할 항목을 추가하세요
  // { id: "cardnews_xxx", folder: "public/company-news/xxx" },
];

async function uploadFolder(folderPath: string): Promise<string[]> {
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

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

async function main() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sqlPath = `scripts/sql/migrate_cdn_${today}.sql`;
  const sqlLines = [`-- 로컬 → CDN 이관 (${today})\n`];

  for (const item of MIGRATE_ITEMS) {
    console.log(`\n▶ ${item.id}`);
    process.stdout.write("  업로드 중 ");
    const urls = await uploadFolder(path.resolve(item.folder));
    const [first] = urls;
    const arrSql = `ARRAY[${urls.map((u) => `'${u}'`).join(", ")}]`;

    sqlLines.push(`UPDATE "CompanyNews" SET
  "imageUrl"  = '${first}',
  "imageUrls" = ${arrSql},
  "updatedAt" = NOW()
WHERE id = '${item.id}';\n`);

    fs.rmSync(path.resolve(item.folder), { recursive: true, force: true });
    console.log(`  로컬 폴더 삭제: ${item.folder}`);
  }

  if (!fs.existsSync("scripts/sql")) fs.mkdirSync("scripts/sql", { recursive: true });
  fs.writeFileSync(sqlPath, sqlLines.join("\n"), "utf-8");
  console.log(`\n✅ 완료. SQL: ${sqlPath}`);
  console.log("→ Supabase SQL Editor에서 실행하세요.");
}

main().catch((e) => { console.error("❌", e); process.exit(1); });

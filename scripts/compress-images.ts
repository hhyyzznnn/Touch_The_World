/**
 * public/company-news 내 대용량 webp 재압축
 * 실행: npx tsx scripts/compress-images.ts
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "public/company-news");
const SIZE_THRESHOLD = 200 * 1024; // 200KB
const QUALITY = 78; // webp quality (기본 80에서 약간 낮춤)

async function compressFile(filePath: string): Promise<{ before: number; after: number }> {
  const before = fs.statSync(filePath).size;
  const tmp = filePath + ".tmp";

  await sharp(filePath)
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(tmp);

  const after = fs.statSync(tmp).size;

  if (after < before) {
    fs.renameSync(tmp, filePath);
  } else {
    fs.unlinkSync(tmp); // 오히려 커지면 원본 유지
  }

  return { before, after: after < before ? after : before };
}

function formatKB(bytes: number) {
  return (bytes / 1024).toFixed(0) + "KB";
}

async function main() {
  const allFiles = fs
    .readdirSync(BASE_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((dir) =>
      fs.readdirSync(path.join(BASE_DIR, dir.name))
        .filter((f) => /\.webp$/i.test(f))
        .map((f) => path.join(BASE_DIR, dir.name, f))
    );

  const targets = allFiles.filter((f) => fs.statSync(f).size > SIZE_THRESHOLD);
  console.log(`전체 webp: ${allFiles.length}장 | 200KB 초과: ${targets.length}장\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of targets) {
    const rel = path.relative(process.cwd(), file);
    const { before, after } = await compressFile(file);
    const saved = before - after;
    totalBefore += before;
    totalAfter += after;
    console.log(
      `${saved > 0 ? "✓" : "─"} ${rel.padEnd(80)} ${formatKB(before)} → ${formatKB(after)}${saved > 0 ? ` (-${formatKB(saved)})` : " (유지)"}`
    );
  }

  const totalSaved = totalBefore - totalAfter;
  console.log(`\n총 절감: ${formatKB(totalSaved)} (${formatKB(totalBefore)} → ${formatKB(totalAfter)})`);
}

main().catch(console.error);

/**
 * 카드뉴스 이미지 업로드 스크립트
 *
 * 워크플로:
 *   1. public/company-news/<폴더명>/ 에 이미지 넣기
 *   2. 아래 NEWS_ITEMS 배열에 항목 추가 (Claude가 작성)
 *   3. npx tsx scripts/upload-card-news.ts 실행
 *      → UploadThing 업로드 + DB 반영까지 이 스크립트가 직접 처리합니다.
 *      → scripts/sql/upload_YYYYMMDD.sql은 기록용 로그로만 남습니다 (실행 불필요).
 *   4. 로컬 이미지 폴더는 삭제 전, 형제 디렉터리에 ../cardnews-shorts가 있으면
 *      그쪽 input/<폴더명>/에 먼저 복사해둡니다 — 나중에 유튜브 영상 파이프라인을 돌릴 때
 *      CDN에서 이미지를 다시 받아올 필요 없이 바로 이어서 쓸 수 있습니다.
 *
 * 필수 환경변수: UPLOADTHING_TOKEN, DATABASE_URL
 */

import { config } from "dotenv";
config({ path: ".env" });

import { UTApi } from "uploadthing/server";
import { CompanyNewsType, PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN! });
const prisma = new PrismaClient();

interface NewsItem {
  folder: string;               // public/company-news/폴더명
  id: string;                   // DB 고유 ID (cardnews_xxx_yyyy)
  type: CompanyNewsType;
  categories: string[];         // 2개 이상 카테고리에 걸치면 복수 지정 가능
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
  //   categories: ["국내외 교육여행"], // 2개 이상 카테고리에 걸치면 배열에 추가로 나열
  //   title: "제목", // 검색용 키워드(연도·지역·프로그램 종류)를 항상 맨 앞에, 후킹 문구는 " — " 뒤로.
  //                  // 예: "2026 후쿠오카 글로벌 현장학습 — 학교는 안심하고, 학생은 성장하는" (O)
  //                  //     "학교는 안심하고, 학생은 성장하는 — 2026 후쿠오카 글로벌 현장학습" (X, 검색 노출에 불리)
  //                  // (title이 페이지 <title>·OG·구조화 데이터 headline에 그대로 쓰이므로 SEO에 직결됨.
  //                  //  단, BOOK_CARD_NEWS는 "책 제목 — 저자 저" 형식 유지)
  //   summary: "한 줄 요약",
  //   content: `## 본문 마크다운`,
  //   hashtags: ["#일본", "#특성화고"], // lib/news-constants.ts의 HASHTAG_POOL에서만 골라 쓸 것 (지역 1개 + 대상 1~2개, 총 3개 안팎)
  //   deleteLocalAfterUpload: true,
  // },
];
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ../cardnews-shorts (형제 저장소)가 로컬에 있으면, 삭제 전 이미지 폴더를 그쪽 input/에 복사해둔다.
 * 없으면(다른 환경이거나 아직 클론 안 했으면) 조용히 건너뛴다 — 필수 의존성이 아님.
 */
function copyToCardnewsShortsInput(sourceFolder: string): void {
  // sourceFolder = <repo>/public/company-news/<폴더명> → 4단계 위가 형제 저장소들이 모인 디렉터리
  const targetRoot = path.resolve(sourceFolder, "..", "..", "..", "..", "cardnews-shorts", "input");
  if (!fs.existsSync(targetRoot)) return;

  const targetFolder = path.join(targetRoot, path.basename(sourceFolder));
  if (fs.existsSync(targetFolder)) return; // 이미 있으면 덮어쓰지 않음

  fs.cpSync(sourceFolder, targetFolder, { recursive: true });
  console.log(`  📁 cardnews-shorts/input/${path.basename(sourceFolder)}/ 로 사본 저장 (유튜브 파이프라인용)`);
}

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
  return `$pgtag$${value}$pgtag$`;
}

function pgArray(arr: string[]): string {
  return `ARRAY[${arr.map((s) => `'${s.replace(/'/g, "''")}'`).join(", ")}]`;
}

/** 실행한 내용을 나중에 대조할 수 있도록 기록용 SQL 로그만 남긴다 (실행용 아님) */
function buildLogSql(item: NewsItem, urls: string[], timestamp: string): string {
  return `-- ${item.title}
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  '${item.id}',
  '${item.type}',
  ${pgArray(item.categories)},
  ${pgLiteral(item.title)},
  ${pgLiteral(item.summary)},
  ${pgLiteral(item.content)},
  '${urls[0]}',
  ${pgArray(urls)},
  ${item.link ? `'${item.link}'` : "NULL"},
  ${pgArray(item.hashtags)},
  ${item.isPinned ?? false},
  '${timestamp}', '${timestamp}'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '${timestamp}';
`;
}

async function main() {
  if (NEWS_ITEMS.length === 0) {
    console.log("NEWS_ITEMS가 비어 있습니다. 항목을 추가한 뒤 다시 실행하세요.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sqlPath = `scripts/sql/upload_${today}.sql`;
  const sqlLines: string[] = [`-- 카드뉴스 CDN 업로드 결과 (${today}) — 기록용 로그, DB에는 이 스크립트가 직접 반영함\n`];

  // NOTE: 여러 건을 순차 반영하면서 항목마다 1초씩 늘어나는 타임스탬프를 명시적으로 부여해,
  // 최신순 정렬 시 등록 순서가 뒤섞이지 않도록 한다 (2026-08-02 발견된 버그의 재발 방지).
  const runStart = Date.now();

  for (const [index, item] of NEWS_ITEMS.entries()) {
    console.log(`\n▶ ${item.title}`);
    process.stdout.write("  이미지 업로드 중 ");

    const urls = await uploadFolder(path.resolve(item.folder));
    const itemTimestamp = new Date(runStart + index * 1000);

    console.log("  DB 반영 중...");
    await prisma.companyNews.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        type: item.type,
        categories: item.categories,
        title: item.title,
        summary: item.summary,
        content: item.content,
        imageUrl: urls[0],
        imageUrls: urls,
        link: item.link ?? null,
        hashtags: item.hashtags,
        isPinned: item.isPinned ?? false,
        createdAt: itemTimestamp,
        updatedAt: itemTimestamp,
      },
      update: {
        title: item.title,
        summary: item.summary,
        content: item.content,
        imageUrl: urls[0],
        imageUrls: urls,
        hashtags: item.hashtags,
        updatedAt: itemTimestamp,
      },
    });
    console.log("  ✓ DB 반영 완료");

    sqlLines.push(buildLogSql(item, urls, itemTimestamp.toISOString()));

    if (item.deleteLocalAfterUpload) {
      copyToCardnewsShortsInput(path.resolve(item.folder));
      fs.rmSync(path.resolve(item.folder), { recursive: true, force: true });
      console.log(`  로컬 폴더 삭제 완료: ${item.folder}`);
    }
  }

  if (!fs.existsSync("scripts/sql")) fs.mkdirSync("scripts/sql", { recursive: true });
  fs.writeFileSync(sqlPath, sqlLines.join("\n"), "utf-8");
  console.log(`\n✅ 전체 완료 — DB 반영 끝, 기록 로그: ${sqlPath}`);
}

main()
  .catch((e) => {
    console.error("❌ 오류:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

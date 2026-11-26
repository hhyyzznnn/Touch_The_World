/**
 * IndexNow로 바뀐 페이지를 검색엔진에 바로 알린다 (2026-11-26).
 * IndexNow 참여 엔진: Bing(ChatGPT 검색·Copilot이 씀)·네이버·Yandex 등 — 계정 로그인 없이 키 파일만으로 동작한다.
 * 키 파일: public/92e83a431c485a76ac93092b116c1e64.txt (지우거나 바꾸면 제출이 거절된다)
 *
 * 사용법:
 *   npx tsx scripts/indexnow.ts <주소 또는 /경로 또는 카드뉴스 id> ...
 *   npx tsx scripts/indexnow.ts --sitemap      # 사이트맵 전체
 */
const KEY = "92e83a431c485a76ac93092b116c1e64";
const HOST = "www.touchtheworld.co.kr";
const SITE = `https://${HOST}`;
const ENDPOINTS = ["https://api.indexnow.org/indexnow", "https://searchadvisor.naver.com/indexnow"];

function toUrl(arg: string): string {
  if (arg.startsWith("http")) return arg;
  if (arg.startsWith("/")) return SITE + arg;
  return `${SITE}/news/${arg}`;
}

export async function submitIndexNow(urls: string[]): Promise<void> {
  const urlList = [...new Set(urls)].filter((u) => u.startsWith(SITE));
  if (urlList.length === 0) return;
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList });
  for (const ep of ENDPOINTS) {
    const res = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body }).catch((e) => e as Error);
    const status = res instanceof Error ? `오류 ${res.message}` : `${res.status}`;
    console.log(`  IndexNow ${new URL(ep).host}: ${status} (${urlList.length}개)`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  let urls: string[];
  if (args.includes("--sitemap")) {
    const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } else {
    urls = args.map(toUrl);
  }
  if (urls.length === 0) {
    console.error("사용법: npx tsx scripts/indexnow.ts <주소|/경로|카드뉴스 id> ... | --sitemap");
    process.exit(1);
  }
  await submitIndexNow(urls);
}

if (process.argv[1]?.endsWith("indexnow.ts")) main();

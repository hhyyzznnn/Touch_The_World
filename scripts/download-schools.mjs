/**
 * NEIS API로 전국 중·고등학교 목록 다운로드
 * 사용법: NEIS_API_KEY=발급받은키 node scripts/download-schools.mjs
 *
 * API 키 발급: https://open.neis.go.kr → 로그인 → 인증키 발급
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY = process.env.NEIS_API_KEY;

if (!KEY) {
  console.error("❌ NEIS_API_KEY 환경변수가 없습니다.");
  console.error("   사용법: NEIS_API_KEY=발급받은키 node scripts/download-schools.mjs");
  process.exit(1);
}

const REGION_MAP = {
  서울특별시: "서울/경기",
  경기도: "서울/경기",
  인천광역시: "인천",
  강원도: "강원",
  강원특별자치도: "강원",
  충청남도: "충청",
  충청북도: "충청",
  대전광역시: "충청",
  세종특별자치시: "충청",
  전라남도: "전라",
  전라북도: "전라",
  전북특별자치도: "전라",
  광주광역시: "전라",
  경상남도: "경상",
  경상북도: "경상",
  부산광역시: "경상",
  대구광역시: "경상",
  울산광역시: "경상",
  제주특별자치도: "제주",
};

const TARGET_KINDS = new Set(["중학교", "고등학교", "초등학교"]);

async function fetchPage(pIndex, pSize = 1000) {
  const url = new URL("https://open.neis.go.kr/hub/schoolInfo");
  url.searchParams.set("KEY", KEY);
  url.searchParams.set("Type", "json");
  url.searchParams.set("pIndex", pIndex);
  url.searchParams.set("pSize", pSize);

  const res = await fetch(url.toString());
  const json = await res.json();
  const info = json?.schoolInfo;
  if (!info) return { rows: [], total: 0 };

  const total = info[0]?.head?.[0]?.list_total_count ?? 0;
  const rows = info[1]?.row ?? [];
  return { rows, total };
}

async function main() {
  console.log("📥 학교 데이터 다운로드 시작...");

  const { rows: first, total } = await fetchPage(1);
  const pages = Math.ceil(total / 1000);
  console.log(`   전체 ${total}개 학교, ${pages}페이지`);

  const all = [...first];
  for (let p = 2; p <= pages; p++) {
    process.stdout.write(`   페이지 ${p}/${pages}...\r`);
    const { rows } = await fetchPage(p);
    all.push(...rows);
    await new Promise((r) => setTimeout(r, 100)); // 100ms 딜레이
  }

  console.log(`\n   ${all.length}개 수집 완료`);

  const filtered = all
    .filter((r) => TARGET_KINDS.has(r.SCHUL_KND_SC_NM))
    .map((r) => {
      let level = r.SCHUL_KND_SC_NM;
      if (level === "고등학교" && r.HS_SC_NM === "특성화고") level = "특성화고";
      return {
        n: r.SCHUL_NM,
        l: level,
        r: REGION_MAP[r.LCTN_SC_NM] ?? null,
      };
    })
    .sort((a, b) => a.n.localeCompare(b.n, "ko"));

  console.log(`   필터 후 ${filtered.length}개 (중·고·초등)`);

  const outPath = resolve(__dirname, "../lib/data/schools.json");
  writeFileSync(outPath, JSON.stringify(filtered), "utf-8");

  const kb = Math.round(Buffer.byteLength(JSON.stringify(filtered)) / 1024);
  console.log(`✅ 저장 완료: lib/data/schools.json (${kb}KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });

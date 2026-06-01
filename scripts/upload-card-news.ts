/**
 * 카드뉴스 이미지 업로드 + DB 등록 스크립트
 * 실행: npx tsx scripts/upload-card-news.ts
 */

import { UTApi } from "uploadthing/server";
import { PrismaClient, CompanyNewsType } from "@prisma/client";
import fs from "fs";
import path from "path";

const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN!,
});
const prisma = new PrismaClient();

async function uploadFolder(folderPath: string): Promise<string[]> {
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  console.log(`  업로드 중: ${files.length}장 (${path.basename(folderPath)})`);

  const uploadedUrls: string[] = [];

  for (const filename of files) {
    const buffer = fs.readFileSync(path.join(folderPath, filename));
    const file = new File([buffer], filename, { type: "image/png" });
    const result = await utapi.uploadFiles(file);

    if (result.error) {
      throw new Error(`업로드 실패 (${filename}): ${result.error.message}`);
    }
    const url = result.data.ufsUrl ?? result.data.url;
    uploadedUrls.push(url);
    process.stdout.write(".");
  }

  console.log(" 완료");
  return uploadedUrls;
}

const NEWS_ITEMS = [
  {
    folder: "public/company-news/교직원 인스파이어",
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    category: "교사 연수",
    title: "2026 교직원 연수 — 인스파이어 리조트 1박 2일",
    summary:
      "서울교총·인천관광공사·교육여행연구소가 함께 만든 교직원 전용 연수. 1인당 30만 원, 평일 1박 2일, 30명 기준으로 운영합니다.",
    content: `## 프로그램 개요

선생님들의 노고에 감사드리며, 온전한 쉼과 재충전을 위해 정성을 다해 기획했습니다.

| 항목 | 내용 |
|------|------|
| 프로그램명 | 2026 교직원 연수 (인스파이어 리조트 1박 2일) |
| 대상 | 서울교총 워크샵 · 학교단위 교직원연수 (30명 기준) |
| 일정 | 평일 1박 2일 |
| 참가비 | 1인당 300,000원 |
| 협력 | 인천관광공사 · 인스파이어 리조트 · 하나투어 |

## 주관·협력 기관

- **서울교총** — 프로그램 기획 및 대상 교원 연계
- **인천관광공사** — 지역 연수 콘텐츠 및 지원
- **교육여행연구소** — 전체 운영 및 일정 설계
- **인스파이어 리조트** — 숙박·시설 제공

문의: 터치더월드 1800-8078`,
    hashtags: ["#교사연수", "#인천", "#국내", "#인스파이어"],
    isPinned: false,
  },
  {
    folder: "public/company-news/전주 공고",
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    category: "특성화고 프로그램",
    title: "전주 공업계열 학생들의 미래를 인천에서 열다",
    summary:
      "인천관광공사 수요자 맞춤형 교육여행 지원사업. AI·반도체·수소에너지·군특성화·인천문화탐방 5개 테마로 구성된 전주 공업계열 특화 프로그램.",
    content: `## 왜 인천인가?

- **교육여행 성지**: 2023년 1만 명 → 2025년 4만 2,892명, 3년 연속 급성장
- **송도국제도시**: 앰코코리아·브릴스·스타트업파크 등 첨단기업 집적지
- **서인천**: 서부발전 수소연료전지 발전소·두산퓨얼셀 에너지 거점
- **해군 인천해역방어사령부**: 군특성화 안보 교육 최적지
- **개항장·강화도·월미도·영종도·송도**: 5개 역사문화 지역 집중 분포
- **인천관광공사 버스비 지원**: 최대 500만 원 — 전국 유일 파격 혜택

## 5가지 테마 프로그램

| 테마 | 내용 |
|------|------|
| 테마1 · AI | 브릴스 로봇 견학 / 스타트업파크 투어 |
| 테마2 · 반도체 | 인하대 클린룸 실습 / 앰코코리아 견학 |
| 테마3 · 수소에너지 | 서인천발전본부 / 두산퓨얼셀 특강 |
| 테마4 · 군특성화 | 해군 인방사 함정 견학 |
| 테마5 · 인천문화탐방 | 개항장·월미도·강화도·영종도·송도 |

## 운영 정보

- **숙소**: 하버파크호텔 (인천 중구 제물량로 217)
- **일정**: 1박 2일 / 2박 3일 선택
- **주관**: 터치더월드
- **연계지원**: 인천관광공사 수요자 맞춤형 교육여행 지원사업
- **홈페이지**: www.ito.or.kr

문의: 1800-8078 · pjjttw@naver.com`,
    hashtags: ["#특성화고", "#인천", "#공고", "#진로체험"],
    isPinned: false,
  },
  {
    folder: "public/company-news/교토:오사카",
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    category: "국내외 교육여행",
    title: "2026학년도 일본 수학여행 — 오사카·나라·교토 5일 추천 프로그램",
    summary:
      "나라 사슴공원·금각사·유니버설스튜디오·도톤보리까지, 학생 만족도 높은 간사이 핵심 5일 코스를 담았습니다.",
    content: `## 여행 개요

대한항공 KE2171편(김포 09:35 출발 → 오사카 11:20 도착)으로 떠나는 간사이 5일 수학여행 추천 코스입니다.

## 일정 요약

| 일차 | 주요 일정 |
|------|-----------|
| 1일 | 인천 출발 → 나라(동대사·사슴공원) → 오쓰 료칸 체크인 (유카타·가이세키 체험) |
| 2일 | 교토 — 리츠메이칸 대학교 유학설명회 & 탐방, 청수사, 니넨자카·산넨자카, 금각사 |
| 3일 | 유니버설스튜디오 재팬 (자유 관람) |
| 4일 | 오사카성 → 도톤보리 → 신사이바시 쇼핑 |
| 5일 | 오사카 출발 → 인천/김포 귀국 |

## 이 코스의 포인트

- **진로 탐색**: 리츠메이칸 대학교 유학 설명회로 대입·해외진학 관심 유도
- **문화유산**: 나라 사슴공원, 청수사, 금각사 등 유네스코 세계유산 탐방
- **전통 체험**: 오쓰 료칸 숙박, 유카타·가이세키 체험
- **엔터테인먼트**: 유니버설스튜디오 재팬 자유 관람

문의: 터치더월드 1800-8078`,
    hashtags: ["#일본", "#수학여행", "#오사카", "#교토"],
    isPinned: false,
  },
  {
    folder: "public/company-news/오사카 수학여행",
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    category: "국내외 교육여행",
    title: "외국어고등학교를 위한 일본 오사카 교육여행 안내",
    summary:
      "학술성·국제교류·진로탐색·안전운영을 결합한 간사이권 교육여행 모델. 관광이 아닌 교육과정의 확장입니다.",
    content: `## 외국어고 수학여행은 달라야 한다

외국어고의 해외 수학여행은 여행이 아니라 교육과정의 확장입니다.

| 구분 | 일반 관광형 | 교육여행형 |
|------|------------|-----------|
| 언어 활용 | 단순 관광지 관람 중심 | 현지 수업·인터뷰·미션을 통한 실질적 언어 사용 |
| 진로 탐색 | 정해진 일정 속 수동적 경험 | 전공·직업 체험으로 진로 인사이트 확보 |
| 국제교류 | 짧은 만남 위주의 일회성 교류 | 현지 학생·학교와의 프로젝트형 교류 |
| 결과물 | 개인 기념 위주의 단순 기록 | 보고서·발표·영상 등 교육적 결과물 도출 |

## 오사카권 지역별 교육 특성

- **오사카**: 현대 도시문화·콘텐츠 산업
- **교토**: 전통문화·대학 진로탐색 (리츠메이칸·도시샤 등)
- **나라**: 일본 고대사·문화유산
- **고베·오쓰**: 료칸·유카타·생활문화 체험

## 학교 유형별 추천 조합

**진로·진학 강화형**
일본명문대 탐방 및 특강 + 학교 수업 참관 → 사전 전공조사·귀국 후 대학 비교 보고서

**국제교류 강화형**
자매교 세미나 + 홈스테이 → 공식 교류 실적 확보

**언어실습 강화형**
현지대학생 가이드 투어 + 자유활동 미션 → 실전 소통 경험

> 많이 넣는 일정보다 학교 목표에 맞게 선명하게 설계된 일정이 설명력과 만족도를 높입니다.

문의: 터치더월드 1800-8078`,
    hashtags: ["#일본", "#오사카", "#외국어고", "#교육여행"],
    isPinned: false,
  },
  {
    folder: "public/company-news/일본 국제화사업",
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    category: "특성화고 프로그램",
    title: "상업계 특성화고 일본 국제화사업 추천 프로그램 — 후쿠오카 4박 5일",
    summary:
      "진에어 직항으로 떠나는 후쿠오카 4박 5일. 학생 10~20명 소규모로 운영하는 상업계 특성화고 맞춤 국제화사업입니다.",
    content: `## 프로그램 개요

| 항목 | 내용 |
|------|------|
| 항공 | 진에어 LJ273/LJ264 (인천 ↔ 후쿠오카, 약 2시간 25분) |
| 지역 | 일본 후쿠오카 |
| 기간 | 4박 5일 |
| 인원 | 학생 10~20명 · 교사 2명 · 인솔가이드 1명 |
| 출발 | 2026년 예정 |

## 일정 요약

**제1일 — 인천 → 후쿠오카**
- 07:30 인천국제공항 집결 · 가이드 미팅
- 09:40 출발 → 11:10 후쿠오카 도착
- 후쿠오카타워 전망대 견학 & 동 조망
- 세계적 건축가거리 견학
- 인공해변 모모치해변 견학
- 석식 후 WBF 호텔 체크인

## 이 프로그램의 특징

- **소규모 집중 운영**: 학생 10~20명으로 교사·가이드의 밀착 관리 가능
- **직항 편의성**: 진에어 직항으로 2시간 25분, 이동 피로 최소화
- **국제화사업 적합**: 상업계 특성화고 국제화 역량 강화 목적에 최적화
- **일정·인원 맞춤 상담**: 학교 교육목표에 맞춰 세부 일정 조율 가능

문의: 터치더월드 1800-8078 (일정·인원 맞춤 상담 가능)`,
    hashtags: ["#일본", "#후쿠오카", "#특성화고", "#국제화사업"],
    isPinned: false,
  },
];

async function main() {
  console.log("=== 카드뉴스 업로드 시작 ===\n");

  for (const item of NEWS_ITEMS) {
    console.log(`\n[${item.title}]`);

    // 이미 DB에 같은 제목으로 등록된 경우 건너뜀
    const existing = await prisma.companyNews.findFirst({
      where: { title: item.title },
    });
    if (existing) {
      console.log("  이미 등록됨 — 건너뜀");
      continue;
    }

    const folderPath = path.join(process.cwd(), item.folder);
    if (!fs.existsSync(folderPath)) {
      console.error(`  폴더 없음: ${folderPath}`);
      continue;
    }

    const urls = await uploadFolder(folderPath);
    const [imageUrl, ...restUrls] = urls;

    const created = await prisma.companyNews.create({
      data: {
        type: item.type,
        category: item.category,
        title: item.title,
        summary: item.summary,
        content: item.content,
        imageUrl,
        imageUrls: urls,
        hashtags: item.hashtags,
        isPinned: item.isPinned,
      },
    });

    console.log(`  DB 등록 완료 (id: ${created.id})`);
    console.log(`  이미지: ${urls.length}장 업로드됨`);
  }

  console.log("\n=== 완료 ===");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

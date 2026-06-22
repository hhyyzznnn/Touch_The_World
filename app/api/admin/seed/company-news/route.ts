import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { CompanyNewsType } from "@prisma/client";

const BASE = "/company-news";

const items = [
  {
    type: CompanyNewsType.COMPANY_NEWS,
    title: "왜 다시 외고인가? — 외고 진학을 고민하는 가족을 위한 안내서",
    summary:
      "외고 입학을 앞두고 막연한 환상과 두려움 사이에서 고민하는 학부모·학생·교사를 위해, 이향근 저자가 외고의 진짜 이야기를 담았습니다.",
    content: `외고, 정말 우리 아이에게 맞을까요? 성적만 좋으면 가도 될까요?

이 카드뉴스는 이향근 저자의 도서 《왜 다시 외고인가?》를 소개합니다. 외고 진학을 고민하는 학부모·학생·교사 모두를 위한 단 한 권의 안내서입니다.

▶ Chapter 1 외고, 오해와 진실
입시 기계가 아닌 글로벌 인재의 요람으로서의 외고를 이해합니다.

▶ Chapter 2 외고에 '맞는' 아이
어학 흥미, 자기주도 학습, 회복 탄력성을 갖춘 아이에게 적합합니다.

▶ Chapter 3 외고에 '안 맞는' 아이
성적은 좋지만 경쟁에 취약한 아이라면 신중히 고민해야 합니다.

▶ Chapter 4 입학 전 갖춰야 할 무기
독해력·시간관리·단단한 멘탈이 핵심입니다.

▶ Chapter 5 미래를 선점하는 교육의 요람
안양외고의 교육적 실천과 비전을 소개합니다.

꽃은 저마다 피는 계절이 다를 뿐, 모든 아이는 자기만의 속도로 피어납니다.`,
    imageUrl: `${BASE}/waego-book-2026/01.png`,
    imageUrls: Array.from({ length: 10 }, (_, i) => `${BASE}/waego-book-2026/${String(i + 1).padStart(2, "0")}.png`),
    hashtags: ["#외고", "#외국어고등학교", "#진학상담", "#입시정보", "#이향근"],
  },
  {
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    category: "해외",
    title: "전국 조리과·제과제빵과 학생을 위한 후쿠오카 체험학습",
    summary:
      "맛있는 꿈을 찾아 떠나는 후쿠오카 체험학습! 일본 최고의 요리학교 체험부터 히요코·명란 산업체 방문까지, 미식·문화·진로를 한 번에 경험합니다.",
    content: `전국 조리과·제과제빵과 학생을 위한 특별한 일본 후쿠오카 체험학습 프로그램입니다.

▶ 사전교육
출발 전 일본 문화(식문화·예절·기본회화), 현명한 기버(Giver) 리더십, 일본 스타트업 시장 사전 학습

▶ 현지 문화 탐방
후쿠오카 타워 전망대, 모모치 인공해변, 후쿠오카 돔, 캐릭터샵, 다자이후 텐만구

▶ 일본 최고 요리학교 체험 & 학교 점심
나카무라조리제과전문학교·아소(ASO)전문학교그룹에서 조리·제과제빵을 직접 체험하고, 현지 학교 급식도 경험합니다.

▶ 고교 자매교 교류
후쿠오카 현지 고교생들과 함께 요리하고 소통하는 특별한 만남. 언어는 달라도 '맛'으로 통합니다.

▶ 산업체 방문
히요코 과자 공장 견학·체험 / 명란(멘타이코) 공장 & 전시장 / 마루타케 주방상사 방문

▶ 후쿠오카 음식 대탐험
이치란·잇푸도 라멘, 회전스시, 샤브샤브, 규동, 오코노미야키, 아키소바 등 현지 명물 음식 체험

▶ 핵심 상권 & 명소 업체 탐방
하카타역·캐널시티·하카타·텐진 지하상가의 조리·제과제빵 1등 업체 탐방`,
    imageUrl: `${BASE}/fukuoka-bakery-2026/01.png`,
    imageUrls: Array.from({ length: 10 }, (_, i) => `${BASE}/fukuoka-bakery-2026/${String(i + 1).padStart(2, "0")}.png`),
    hashtags: ["#후쿠오카체험학습", "#조리과", "#제과제빵", "#일본수학여행", "#진로체험", "#해외체험학습"],
  },
  {
    type: CompanyNewsType.PROGRAM_CARD_NEWS,
    category: "해외",
    title: "대한민국 특성화고를 위한 일본 후쿠오카 수학여행 프로그램",
    summary:
      "국내 수학여행 예산으로 일본 수학여행을! 공업계·상업계 특성화고 특화 코스로 자동차 공장·스타트업·스마트 물류까지, 미래 직업 현장을 직접 경험합니다.",
    content: `대한민국 특성화고를 위한 일본 후쿠오카 수학여행 — 미래를 설계하는 기술과 문화의 융합 여행

왜 후쿠오카인가? 국내 수학여행 예산으로 일본 수학여행이 가능한 공업계·상업계 특성화고 특화 지역입니다.

▶ [IT/창업] Fukuoka Growth Next
폐교에서 피어난 글로벌 스타트업의 꿈. 창업 생태계 현장을 직접 체험합니다.

▶ [미래 제조] 자동차 공장 견학
세계를 선도하는 정밀 제조 기술의 현장. 로봇 자동화 생산 라인을 눈으로 확인합니다.

▶ [환경/에너지] 아일랜드 시티
지속 가능한 미래를 그리는 인공섬. 신재생에너지와 친환경 도시 설계를 배웁니다.

▶ [스마트 물류] 베지풀 스타디움
첨단 기술이 바꾼 유통과 물류의 패러다임. AI·IoT 기반 스마트 물류 현장을 견학합니다.

▶ [글로벌 역량] 기회의 땅, 일본
밖에서 보면 나와 대한민국이 보입니다. 글로벌 시각을 키우는 특별한 경험.

▶ 전공별 맞춤 진정한 교육여행
기계과·전기과·경영과·정보과 등 학과별 맞춤 코스로 구성. 시간 때우기 식 여행이 아닌 진로와 연결되는 진짜 교육여행.`,
    imageUrl: `${BASE}/fukuoka-school-trip-2026/01.png`,
    imageUrls: Array.from({ length: 10 }, (_, i) => `${BASE}/fukuoka-school-trip-2026/${String(i + 1).padStart(2, "0")}.png`),
    hashtags: ["#후쿠오카수학여행", "#특성화고", "#해외수학여행", "#일본수학여행", "#진로체험", "#공업계", "#상업계"],
  },
];

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];
  for (const item of items) {
    const existing = await prisma.companyNews.findFirst({ where: { title: item.title } });
    if (existing) {
      results.push({ skipped: true, title: item.title, id: existing.id });
      continue;
    }
    const created = await prisma.companyNews.create({ data: { ...item, isPinned: false } });
    results.push({ created: true, title: created.title, id: created.id });
  }

  return NextResponse.json({ success: true, results });
}

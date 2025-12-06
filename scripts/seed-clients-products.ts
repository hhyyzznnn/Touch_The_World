import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("고객사 및 상품 데이터 시드 시작...");

  // 기존 임의로 만든 프로그램들 삭제 (제주도, 부산, 경주, 일본 교류, AI 융합, 진로 탐색)
  const oldProgramTitles = [
    "제주도 수학여행 3박 4일",
    "부산 수련활동 2박 3일",
    "경주 역사 문화 탐방",
    "일본 교류 프로그램",
    "AI 융합 교육 프로그램",
    "진로 탐색 특강",
  ];

  console.log("🗑️  기존 임의 프로그램 삭제 중...");
  for (const title of oldProgramTitles) {
    try {
      await prisma.program.deleteMany({
        where: { title },
      });
    } catch (error) {
      // 이미 삭제되었거나 없는 경우 무시
    }
  }
  console.log("✅ 기존 프로그램 삭제 완료");

  // 고객사 데이터
  const clients = [
    // 공공·교육기관 / 정부·관광 관련
    { name: "한국관광공사", type: "public", country: "KR" },
    { name: "Taiwan Tourism (Taiwan – The Heart of Asia)", type: "public", country: "TW" },
    { name: "일본정부관광국(JNTO)", type: "public", country: "JP" },
    
    // 대학교
    { name: "고려대학교", type: "university", country: "KR" },
    { name: "가천대학교", type: "university", country: "KR" },
    { name: "연성대학교", type: "university", country: "KR" },
    { name: "인덕대학교", type: "university", country: "KR" },
    { name: "한국외국어대학교", type: "university", country: "KR" },
    { name: "한국조리외식전문학교", type: "university", country: "KR" },
    
    // 고등학교
    { name: "서울세종고등학교", type: "highschool", country: "KR" },
    { name: "과천외국어고등학교", type: "highschool", country: "KR" },
    { name: "안양외국어고등학교", type: "highschool", country: "KR" },
    { name: "한영외국어고등학교", type: "highschool", country: "KR" },
    { name: "성덕고등학교", type: "highschool", country: "KR" },
    { name: "경기북부 비즈니스고등학교", type: "highschool", country: "KR" },
    { name: "안성여자고등학교", type: "highschool", country: "KR" },
    { name: "창문여자고등학교", type: "highschool", country: "KR" },
    
    // 기업 / 단체
    { name: "하나투어", type: "corporation", country: "KR" },
    { name: "eduHana (에듀하나)", type: "corporation", country: "KR" },
    { name: "에듀팡", type: "corporation", country: "KR" },
    { name: "한국리더십센터(KLC)", type: "corporation", country: "KR" },
    { name: "Sight Camp", type: "corporation", country: "KR" },
    { name: "MK문화센터", type: "corporation", country: "KR" },
    { name: "Hamsoa(함소아)", type: "corporation", country: "KR" },
    { name: "Cheong Pung Resort(청풍리조트)", type: "corporation", country: "KR" },
  ];

  // 고객사 생성 (중복 방지 - upsert 사용)
  for (const clientData of clients) {
    try {
      await prisma.client.upsert({
        where: { name: clientData.name },
        update: {},
        create: clientData,
      });
    } catch (error) {
      console.error(`고객사 생성 실패: ${clientData.name}`, error);
    }
  }
  console.log(`✅ ${clients.length}개 고객사 처리 완료`);

  // 상품 데이터
  const products = [
    // A. 교육·학습 캠프
    {
      title: "명품 독서캠프",
      category: "camp",
      region: "Korea",
      duration: "4박 5일",
      target: "청소년",
      description: "가성준 작가와 함께하는 독서 캠프",
    },
    {
      title: "IMS 글로벌 영어캠프",
      category: "camp",
      region: "Global",
      duration: null,
      partner: "IMS",
      target: "청소년",
      description: "국제 영어캠프 프로그램",
    },
    {
      title: "2018 기적의 공부법 CAMP",
      category: "camp",
      region: "Korea",
      duration: "5박 6일",
      target: "청소년",
      description: "제주도에서 진행하는 자기주도학습 기반 캠프",
    },
    {
      title: "HELP Junior 필리핀 영어캠프",
      category: "camp",
      region: "Philippines",
      target: "초·중등",
      description: "글로벌 영어 인재 양성을 위한 필리핀 영어캠프",
    },
    {
      title: "일본어 단기연수 집중 프로그램",
      category: "study_abroad",
      region: "Japan",
      duration: "2주",
      partner: "미야자키 국제대학교",
      target: "중고생",
      description: "일본어 단기연수 집중 프로그램",
    },
    
    // B. 문화·예술·체험 프로그램
    {
      title: "방송·입문 체험교실 — MBC World",
      category: "culture",
      region: "Korea",
      target: "청소년",
      description: "미디어 방송 직업체험 - 아나운서 체험, 스마트 영상 제작",
    },
    {
      title: "런닝맨 체험 + 그레뱅 뮤지엄 패키지",
      category: "culture",
      region: "Korea",
      target: "청소년",
      description: "런닝맨 게임 체험 + 실내 테마파크, 그레뱅 뮤지엄 관람 포함",
    },
    {
      title: "노트르담 드 파리 공연 관람",
      category: "culture",
      region: "Global",
      target: "청소년",
      description: "해외 유명 뮤지컬 관람 프로그램",
    },
    
    // C. 스포츠 연계 프로그램
    {
      title: "배드민턴 월드투어 (Japan)",
      category: "sports",
      region: "Japan",
      duration: "2박 3일 또는 3박 4일",
      target: "청소년",
      description: "국제 배드민턴 대회 관람 및 연계 활동",
    },
    
    // D. 인문학·체험학습
    {
      title: "제주 인문학 SUMMER CAMP",
      category: "camp",
      region: "Korea",
      duration: "1박 2일 워크숍 + 제주 탐방",
      target: "청소년",
      description: "온라인 교육, 1박 2일 워크숍, 제주 역사·문화 탐방",
    },
    
    // E. 리더십 / 인성 프로그램
    {
      title: "리더십 인성 캠프 프로그램",
      category: "leadership",
      region: "Korea",
      duration: "2박 3일 또는 3박 4일",
      partner: "안양외국어고등학교",
      target: "청소년",
      description: "리더십 인성 캠프 프로그램",
    },
    {
      title: "학생 간부 트레이닝 프로그램",
      category: "leadership",
      region: "Korea",
      duration: "1박 2일 또는 2박 3일",
      target: "학생 간부",
      description: "학생회·간부 조직 운영 능력 강화 프로그램",
    },
  ];

  // 카테고리 매핑 (Product category -> Program category)
  const categoryMapping: Record<string, string> = {
    camp: "수련활동",
    culture: "현장 체험학습",
    sports: "현장 체험학습",
    study_abroad: "해외탐방/유학",
    leadership: "교육연수(교사/학생)",
  };

  // 지역 매핑 (Product region -> Program region)
  const regionMapping: Record<string, string> = {
    Korea: "국내",
    Japan: "일본",
    Philippines: "필리핀",
    Global: "글로벌",
  };

  // 상품 생성 및 프로그램으로 변환
  let productCount = 0;
  let programCount = 0;

  for (const productData of products) {
    // 상품 생성 (중복 방지)
    const existingProduct = await prisma.product.findFirst({
      where: { title: productData.title },
    });
    
    if (!existingProduct) {
      await prisma.product.create({
        data: productData,
      });
      productCount++;
    }

    // 프로그램 생성 (중복 방지)
    const existingProgram = await prisma.program.findFirst({
      where: { title: productData.title },
    });

    if (!existingProgram) {
      // Product를 Program으로 변환
      const programCategory = categoryMapping[productData.category] || productData.category;
      const programRegion = productData.region 
        ? regionMapping[productData.region] || productData.region 
        : null;

      // 해시태그 생성 (지역, 대상, 파트너 기반)
      const hashtags: string[] = [];
      if (productData.region) {
        hashtags.push(`#${programRegion || productData.region}`);
      }
      if (productData.target) {
        hashtags.push(`#${productData.target}`);
      }
      if (productData.partner) {
        hashtags.push(`#${productData.partner}`);
      }

      // 요약 생성 (설명이 있으면 사용, 없으면 기본값)
      const summary = productData.description 
        ? productData.description.length > 100 
          ? productData.description.substring(0, 100) + "..."
          : productData.description
        : `${productData.title} 프로그램입니다.`;

      await prisma.program.create({
        data: {
          title: productData.title,
          category: programCategory,
          summary: summary,
          description: productData.description || null,
          region: programRegion,
          hashtags: hashtags,
          priceFrom: null,
          priceTo: null,
          rating: null,
          reviewCount: 0,
          thumbnailUrl: productData.imageUrl || null,
        },
      });
      programCount++;
    }
  }
  console.log(`✅ ${productCount}개 상품 생성 완료`);
  console.log(`✅ ${programCount}개 프로그램 생성 완료`);

  console.log("고객사 및 상품 데이터 시드 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


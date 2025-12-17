import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 데이터베이스 시드 시작...");

  // 기존 데이터 확인
  const existingSchoolCount = await prisma.school.count();
  const existingProgramCount = await prisma.program.count();
  
  if (existingSchoolCount > 0 || existingProgramCount > 0) {
    console.log("⚠️  기존 데이터가 발견되었습니다.");
    console.log(`   - 학교: ${existingSchoolCount}개`);
    console.log(`   - 프로그램: ${existingProgramCount}개`);
    console.log("   기존 데이터를 건너뛰고 새 데이터만 추가합니다.\n");
  }

  // 1. 학교 데이터 생성 (upsert 사용)
  console.log("📚 학교 데이터 생성 중...");
  const schoolData = [
    { name: "서울중앙초등학교", themeColor: "#00954B" },
    { name: "강남중학교", themeColor: "#2E6D45" },
    { name: "서울고등학교", themeColor: "#1D1D1B" },
    { name: "부산국제중학교", themeColor: null },
  ];

  const schools = await Promise.all(
    schoolData.map((data) =>
      prisma.school.upsert({
        where: { name: data.name },
        update: {},
        create: {
          name: data.name,
          themeColor: data.themeColor,
        },
      })
    )
  );
  console.log(`✅ ${schools.length}개 학교 처리 완료`);

  // 2. 프로그램 데이터 생성 (기존 데이터 확인 후 생성)
  console.log("🎯 프로그램 데이터 생성 중...");
  
  const programTitles = [
    "제주도 수학여행 3박 4일",
    "부산 수련활동 2박 3일",
    "경주 역사 문화 탐방",
    "일본 교류 프로그램",
    "AI 융합 교육 프로그램",
    "진로 탐색 특강",
  ];

  // 기존 프로그램 확인
  const existingPrograms = await prisma.program.findMany({
    where: { title: { in: programTitles } },
  });
  const existingTitlesSet = new Set(existingPrograms.map((p) => p.title));

  if (existingPrograms.length > 0) {
    console.log(`   ⚠️  ${existingPrograms.length}개 프로그램이 이미 존재합니다. 건너뜁니다.`);
  }

  // 프로그램 생성 함수
  const createProgramIfNotExists = async (title: string, data: any) => {
    if (existingTitlesSet.has(title)) {
      return await prisma.program.findFirst({ where: { title } });
    }
    return await prisma.program.create({ data });
  };

  const programs = await Promise.all([
    createProgramIfNotExists("제주도 수학여행 3박 4일", {
      title: "제주도 수학여행 3박 4일",
      category: "국내외교육여행",
      summary: "제주도의 아름다운 자연과 문화를 체험하는 수학여행 프로그램입니다.",
      region: "제주특별자치도",
      hashtags: ["#제주도", "#한라산", "#해녀", "#제주민속촌"],
      priceFrom: 229000,
      priceTo: 299000,
      rating: 4.5,
      reviewCount: 23,
      thumbnailUrl: "https://images.unsplash.com/photo-1609840114031-3cf981032e6d?w=800",
      description: `제주도 수학여행은 학생들이 제주도의 독특한 자연 환경과 문화를 직접 체험할 수 있는 프로그램입니다.

주요 일정:
- 제주도 자연사 박물관 견학
- 한라산 등반 체험
- 해녀 문화 체험
- 제주 민속촌 방문
- 해양 스포츠 체험

교육 목표:
- 제주도의 자연 환경 이해
- 지역 문화에 대한 관심 증대
- 협동심과 도전 정신 함양`,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1609840114031-3cf981032e6d?w=800",
          },
          {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
          },
        ],
      },
      schedules: {
        create: [
          {
            day: 1,
            description: `09:00 - 인천공항 출발
11:00 - 제주공항 도착 및 호텔 체크인
12:00 - 점심 식사
14:00 - 제주 자연사 박물관 견학
17:00 - 저녁 식사 및 휴식`,
          },
          {
            day: 2,
            description: `08:00 - 조식
09:00 - 한라산 등반 체험 (성판악 코스)
12:00 - 산 정상 도착 및 도시락 식사
15:00 - 하산 및 호텔 복귀
18:00 - 저녁 식사`,
          },
          {
            day: 3,
            description: `08:00 - 조식
09:00 - 해녀 문화 체험 및 해양 스포츠
12:00 - 점심 식사
14:00 - 제주 민속촌 방문 및 전통 문화 체험
17:00 - 저녁 식사`,
          },
          {
            day: 4,
            description: `08:00 - 조식 및 체크아웃
10:00 - 제주공항 출발
12:00 - 인천공항 도착 및 해산`,
          },
        ],
      },
    }),
    createProgramIfNotExists("부산 수련활동 2박 3일", {
      title: "부산 수련활동 2박 3일",
      category: "수련활동",
      summary: "부산의 해양 환경을 활용한 체험 중심 수련활동입니다.",
      region: "부산광역시",
      hashtags: ["#부산", "#해운대", "#해양스포츠"],
      priceFrom: 189000,
      priceTo: 229000,
      rating: 4.3,
      reviewCount: 15,
      thumbnailUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      description: `부산 수련활동은 해양 환경을 활용한 다양한 체험 프로그램으로 구성되어 있습니다.

주요 활동:
- 해양 생물 관찰
- 해양 스포츠 체험
- 해안가 환경 정화 활동
- 팀 빌딩 활동

교육 목표:
- 해양 환경의 중요성 이해
- 협동심과 리더십 함양
- 환경 보호 의식 함양`,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
          },
        ],
      },
      schedules: {
        create: [
          {
            day: 1,
            description: `08:00 - 서울 출발
13:00 - 부산 도착 및 수련원 체크인
14:00 - 점심 식사
15:00 - 해양 생물 관찰 및 학습
18:00 - 저녁 식사 및 팀 빌딩 활동`,
          },
          {
            day: 2,
            description: `07:00 - 기상 및 조식
09:00 - 해양 스포츠 체험 (카약, 서핑)
12:00 - 점심 식사
14:00 - 해안가 환경 정화 활동
17:00 - 저녁 식사 및 레크리에이션`,
          },
          {
            day: 3,
            description: `07:00 - 기상 및 조식
09:00 - 수련 활동 정리 및 발표
11:00 - 수련원 출발
17:00 - 서울 도착 및 해산`,
          },
        ],
      },
    }),
    createProgramIfNotExists("경주 역사 문화 탐방", {
      title: "경주 역사 문화 탐방",
      category: "체험학습",
      summary: "신라 천년의 고도 경주를 탐방하는 역사 문화 체험 프로그램입니다.",
      region: "경상북도",
      hashtags: ["#경주", "#불국사", "#석굴암", "#신라"],
      priceFrom: 159000,
      priceTo: 199000,
      rating: 4.7,
      reviewCount: 31,
      thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      description: `경주 역사 문화 탐방은 신라 천년의 역사를 직접 체험할 수 있는 프로그램입니다.

주요 방문지:
- 불국사와 석굴암
- 경주 국립 박물관
- 첨성대와 대릉원
- 안압지와 월지
- 경주 양동마을

교육 목표:
- 신라 역사와 문화 이해
- 우리 문화에 대한 자긍심 함양
- 역사적 사고력 향상`,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
          },
        ],
      },
      schedules: {
        create: [
          {
            day: 1,
            description: `08:00 - 서울 출발
12:00 - 경주 도착 및 점심 식사
14:00 - 불국사와 석굴암 방문
17:00 - 호텔 체크인 및 저녁 식사`,
          },
          {
            day: 2,
            description: `08:00 - 조식
09:00 - 경주 국립 박물관 견학
12:00 - 점심 식사
14:00 - 첨성대, 대릉원, 안압지 방문
17:00 - 저녁 식사`,
          },
          {
            day: 3,
            description: `08:00 - 조식
09:00 - 경주 양동마을 방문
12:00 - 점심 식사
13:00 - 서울 출발
17:00 - 서울 도착 및 해산`,
          },
        ],
      },
    }),
    createProgramIfNotExists("일본 교류 프로그램", {
      title: "일본 교류 프로그램",
      category: "해외취업및유학",
      summary: "일본 현지 학교와의 교류를 통한 국제 이해 증진 프로그램입니다.",
      region: "일본 도쿄",
      hashtags: ["#일본", "#도쿄", "#국제교류", "#홈스테이"],
      priceFrom: 899000,
      priceTo: 1299000,
      rating: 4.6,
      reviewCount: 18,
      thumbnailUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
      description: `일본 교류 프로그램은 일본 현지 학교와의 교류를 통해 국제 이해를 증진하는 프로그램입니다.

주요 활동:
- 일본 현지 학교 방문 및 교류
- 홈스테이 체험
- 일본 문화 체험
- 도쿄 명소 탐방

교육 목표:
- 국제 이해 증진
- 문화 다양성 이해
- 외국어 의사소통 능력 향상`,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
          },
        ],
      },
      schedules: {
        create: [
          {
            day: 1,
            description: `08:00 - 인천공항 출발
11:00 - 나리타공항 도착
14:00 - 도쿄 도심 투어
18:00 - 호텔 체크인 및 저녁 식사`,
          },
          {
            day: 2,
            description: `08:00 - 조식
09:00 - 일본 현지 학교 방문 및 교류 활동
12:00 - 점심 식사 (학교 급식 체험)
15:00 - 일본 문화 체험 (다도, 기모노 체험)
18:00 - 홈스테이 가정으로 이동`,
          },
          {
            day: 3,
            description: `07:00 - 홈스테이 가정에서 조식
09:00 - 홈스테이 가정과 함께 지역 탐방
12:00 - 점심 식사
14:00 - 도쿄 명소 탐방 (도쿄 타워, 시부야 등)
18:00 - 호텔 복귀 및 저녁 식사`,
          },
          {
            day: 4,
            description: `08:00 - 조식 및 체크아웃
10:00 - 나리타공항 출발
13:00 - 인천공항 도착 및 해산`,
          },
        ],
      },
    }),
    createProgramIfNotExists("AI 융합 교육 프로그램", {
      title: "AI 융합 교육 프로그램",
      category: "교사연수",
      summary: "AI 기술을 활용한 미래 교육 프로그램입니다.",
      region: "서울특별시",
      hashtags: ["#AI", "#인공지능", "#교육혁신"],
      priceFrom: 129000,
      priceTo: 159000,
      rating: 4.4,
      reviewCount: 12,
      thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      description: `AI 융합 교육 프로그램은 인공지능 기술을 교육에 활용하는 방법을 학습하는 프로그램입니다.

주요 내용:
- AI 기초 이론 학습
- AI 도구 활용 실습
- AI 윤리 교육
- 프로젝트 기반 학습

교육 목표:
- AI 기술 이해
- 미래 교육 방향 탐색
- 창의적 문제 해결 능력 향상`,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
          },
        ],
      },
      schedules: {
        create: [
          {
            day: 1,
            description: `09:00 - 오리엔테이션
10:00 - AI 기초 이론 강의
12:00 - 점심 식사
14:00 - AI 도구 소개 및 실습
17:00 - 저녁 식사`,
          },
          {
            day: 2,
            description: `09:00 - AI 윤리 교육
11:00 - AI 프로젝트 기획
12:00 - 점심 식사
14:00 - 프로젝트 개발 실습
17:00 - 저녁 식사`,
          },
          {
            day: 3,
            description: `09:00 - 프로젝트 발표 및 평가
12:00 - 점심 식사
14:00 - 수료식 및 해산`,
          },
        ],
      },
    }),
    createProgramIfNotExists("진로 탐색 특강", {
      title: "진로 탐색 특강",
      category: "특성화고교프로그램",
      summary: "다양한 직업군을 탐색하고 진로를 설계하는 특강 프로그램입니다.",
      region: "서울특별시",
      hashtags: ["#진로", "#직업탐색", "#진로상담"],
      priceFrom: 89000,
      priceTo: 119000,
      rating: 4.2,
      reviewCount: 8,
      thumbnailUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
      description: `진로 탐색 특강은 학생들이 다양한 직업군을 탐색하고 자신의 진로를 설계할 수 있도록 돕는 프로그램입니다.

주요 내용:
- 다양한 직업군 소개
- 직업인 특강
- 진로 설계 워크숍
- 진로 상담

교육 목표:
- 진로에 대한 관심 증대
- 자신의 적성과 흥미 파악
- 진로 설계 능력 향상`,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
          },
        ],
      },
      schedules: {
        create: [
          {
            day: 1,
            description: `09:00 - 오리엔테이션
10:00 - 다양한 직업군 소개 강의
12:00 - 점심 식사
14:00 - 직업인 특강 (의사, 변호사, 엔지니어 등)
16:00 - 질의응답 및 토론`,
          },
        ],
      },
    }),
  ]);
  console.log(`✅ ${programs.length}개 프로그램 생성 완료`);

  // 3. 행사 데이터 생성
  console.log("🎉 행사 데이터 생성 중...");
  
  // null 체크
  if (!schools[0] || !programs[0]) {
    throw new Error("학교 또는 프로그램 데이터가 없습니다.");
  }
  
  const events = await Promise.all([
    prisma.event.create({
      data: {
        schoolId: schools[0]!.id,
        programId: programs[0]!.id,
        date: new Date("2024-05-15"),
        location: "제주도",
        studentCount: 120,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1609840114031-3cf981032e6d?w=800",
            },
            {
              url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        schoolId: schools[1]!.id,
        programId: programs[1]!.id,
        date: new Date("2024-06-20"),
        location: "부산",
        studentCount: 150,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
            },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        schoolId: schools[2]!.id,
        programId: programs[2]!.id,
        date: new Date("2024-04-10"),
        location: "경주",
        studentCount: 200,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        schoolId: schools[0]!.id,
        programId: programs[3]!.id,
        date: new Date("2024-07-05"),
        location: "일본 도쿄",
        studentCount: 80,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
            },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        schoolId: schools[1]!.id,
        programId: programs[4]!.id,
        date: new Date("2024-08-15"),
        location: "서울",
        studentCount: 100,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
            },
          ],
        },
      },
    }),
    prisma.event.create({
      data: {
        schoolId: schools[2]!.id,
        programId: programs[5]!.id,
        date: new Date("2024-09-20"),
        location: "서울",
        studentCount: 180,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
            },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ ${events.length}개 행사 생성 완료`);

  // 4. 자료실 데이터 생성
  console.log("📄 자료실 데이터 생성 중...");
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        title: "수학여행 안전 관리 매뉴얼",
        fileUrl: "https://example.com/documents/safety-manual.pdf",
        category: "안전관리",
      },
    }),
    prisma.document.create({
      data: {
        title: "수학여행 공문 템플릿",
        fileUrl: "https://example.com/documents/official-letter-template.docx",
        category: "행정서류",
      },
    }),
    prisma.document.create({
      data: {
        title: "체험학습 안내문 양식",
        fileUrl: "https://example.com/documents/field-trip-guide.pdf",
        category: "행정서류",
      },
    }),
    prisma.document.create({
      data: {
        title: "교육과정 운영 계획서",
        fileUrl: "https://example.com/documents/curriculum-plan.pdf",
        category: "교육과정",
      },
    }),
  ]);
  console.log(`✅ ${documents.length}개 자료 생성 완료`);

  // 5. 문의 데이터 생성
  console.log("📧 문의 데이터 생성 중...");
  const inquiries = await Promise.all([
    prisma.inquiry.create({
      data: {
        schoolName: "테스트 초등학교",
        contact: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
        message: "제주도 수학여행 프로그램에 대해 문의드립니다.",
        status: "pending",
      },
    }),
    prisma.inquiry.create({
      data: {
        schoolName: "샘플 중학교",
        contact: "김철수",
        phone: "010-9876-5432",
        email: "sample@example.com",
        message: "부산 수련활동 일정과 비용을 알려주세요.",
        status: "completed",
      },
    }),
  ]);
  console.log(`✅ ${inquiries.length}개 문의 생성 완료`);

  console.log("\n🎉 모든 데이터 시드 완료!");
  console.log("\n생성된 데이터 요약:");
  console.log(`- 학교: ${schools.length}개`);
  console.log(`- 프로그램: ${programs.length}개`);
  console.log(`- 행사: ${events.length}개`);
  console.log(`- 자료: ${documents.length}개`);
  console.log(`- 문의: ${inquiries.length}개`);
}

main()
  .catch((e) => {
    console.error("❌ 시드 중 오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


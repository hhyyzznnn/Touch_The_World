import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  // 2019년
  {
    institution: "안양외국어고등학교",
    year: 2019,
    content: "신입생 리더쉽 캠프(충북제천)",
  },
  {
    institution: "가천대학교",
    year: 2019,
    content: "HIS국내연수",
  },
  {
    institution: "경기자동차과학고등학교",
    year: 2019,
    content: "취업역량강화 연수프로그램",
  },
  // 2020년
  {
    institution: "경희여자고등학교",
    year: 2020,
    content: "국제교류 활동(싱가포르 자매교 방문)",
  },
  // 2022년
  {
    institution: "한영외국어고등학교",
    year: 2022,
    content: "1학년 소규모 테마형 교육여행",
  },
  // 2023년
  {
    institution: "평택마이스터고등학교",
    year: 2023,
    content: "2,3학년 글로벌 산업체 체험학습",
  },
  {
    institution: "안양공업고등학교",
    year: 2023,
    content: "특성화고 발전 방안 모색 워크숍",
  },
  {
    institution: "서울신학대학교",
    year: 2023,
    content: "서울신학대학교 랜선투어-일본 게이오대학",
  },
  {
    institution: "창문여자고등학교",
    year: 2023,
    content: "1,2학년 수련활동",
  },
  {
    institution: "근명고등학교",
    year: 2023,
    content: "해외현장학습(일본 후쿠오카)",
  },
  {
    institution: "유한공업고등학교",
    year: 2023,
    content: "해외글로벌현장학습(다카마츠, 고치, 오카야마, 오사카)",
  },
  {
    institution: "인덕과학기술고등학교",
    year: 2023,
    content: "해외글로벌현장학습(후쿠오카)",
  },
  {
    institution: "연합발명연수(5개학교)",
    year: 2023,
    content: "2023학년도 글로벌 선진견학(독일, 체코) 진행중",
  },
  // 2024년
  {
    institution: "금천고등학교",
    year: 2024,
    content: "해외연수탐방 프로그램(동경 베이커리투어)",
  },
  {
    institution: "서울매그넷고등학교",
    year: 2024,
    content: "특성화고인력양성사업직업교육탐방국외연수프로그램(대만)",
  },
  {
    institution: "유한공업고등학교",
    year: 2024,
    content: "유한공업고등학교 3학년 전환기 교외체험학습(인천)",
  },
  {
    institution: "용산철도고등학교",
    year: 2024,
    content: "글로벌 현장학습 (일본 동경)",
  },
  {
    institution: "영천영동중학교",
    year: 2024,
    content: "국제교류학교 방문및 해외문화탐방(일본 후쿠오카)",
  },
  {
    institution: "인덕과학기술고등학교",
    year: 2024,
    content: "글로벌 현장학습 (일본 후쿠오카)",
  },
  {
    institution: "신목고등학교",
    year: 2024,
    content: "글로벌 현장학습 (일본 후쿠오카)",
  },
  {
    institution: "인덕과학기술고등학교",
    year: 2024,
    content: "미래역량강화사업 수업콘서트(강원도)",
  },
  {
    institution: "인덕과학기술고등학교",
    year: 2024,
    content: "서울형 마이스터고 AI 디지털 활용 수업방법 개선 연수(강원)",
  },
  {
    institution: "서울반도체고등학교",
    year: 2024,
    content: "글로벌 현장 학습(일본 후쿠오카)",
  },
  {
    institution: "한영외국어고등학교",
    year: 2024,
    content: "1, 2학년 수련활동",
  },
  {
    institution: "과천여자고등학교",
    year: 2024,
    content: "체험학습 [인천]",
  },
  {
    institution: "음성동성고등학교",
    year: 2024,
    content: "2학년 현장체험학습(서울일대) 차량임차",
  },
  // 2025년
  {
    institution: "한강미디어고등학교",
    year: 2025,
    content: "한강미디어고등학교 글로벌 현장학습(후쿠오카)",
  },
  {
    institution: "한영외국어고등학교",
    year: 2025,
    content: "한영외국어고등학교 교사연수(강원도)",
  },
];

async function main() {
  console.log("사업 실적 데이터를 추가하는 중...");

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    }).catch((e) => {
      // 이미 존재하는 경우 무시
      if (e.code !== "P2002") {
        console.error(`Error creating achievement:`, achievement, e);
      }
    });
  }

  console.log(`총 ${achievements.length}개의 사업 실적 추가를 시도했습니다.`);
  
  const count = await prisma.achievement.count();
  console.log(`현재 데이터베이스에 ${count}개의 사업 실적이 있습니다.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


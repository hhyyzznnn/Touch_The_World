import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";

export type SeoLandingPageKey =
  | "japan-edu-trip"
  | "school-trip"
  | "teacher-training"
  | "specialized-highschool";

export interface SeoLandingPageData {
  key: SeoLandingPageKey;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string[];
  eyebrow: string;
  lead: string;
  image: string;
  stats: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; body: string; points: string[] }>;
  process: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ label: string; href: string }>;
}

const sharedKeywords = mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS);

export const seoLandingPages: Record<SeoLandingPageKey, SeoLandingPageData> = {
  "japan-edu-trip": {
    key: "japan-edu-trip",
    path: "/programs/japan-edu-trip",
    title: "일본 교육여행",
    metaTitle: "일본 교육여행 | 중고등학교 맞춤형 에듀트립",
    description:
      "터치더월드는 중학교·고등학교를 위한 일본 교육여행, 해외 수학여행, 학교 교류, 역사·문화·미래 산업 탐방을 맞춤 기획합니다.",
    keywords: mergeKeywords(sharedKeywords, [
      "일본 교육여행",
      "일본 에듀트립",
      "일본 수학여행",
      "일본 학교 교류",
      "해외 수학여행",
    ]),
    eyebrow: "중고등학교 맞춤형 해외 교육여행",
    lead:
      "도쿄·오사카·교토·나라·후쿠오카 등 일본 주요 지역을 학교의 교육 목표에 맞춰 설계합니다. 역사·문화·미래 산업·학교 교류를 한 일정 안에 연결해 학생이 직접 배우는 해외 교육여행을 만듭니다.",
    image: "/company-news/japan-edu-trip-2026/01.webp",
    stats: [
      { label: "운영 경험", value: "28년" },
      { label: "추천 일정", value: "3박4일-5박6일" },
      { label: "주요 지역", value: "도쿄·오사카·후쿠오카" },
    ],
    sections: [
      {
        title: "교육 목표에 맞춘 일본 코스 설계",
        body:
          "단순 관광 중심 일정이 아니라 학교가 원하는 학습 성과를 먼저 정하고 지역, 방문지, 체험을 조합합니다.",
        points: ["역사·평화 교육", "미래 산업·진로 탐색", "전통문화·현대문화 체험", "한일 학교 교류"],
      },
      {
        title: "학생 안전과 현장 운영",
        body:
          "사전 안전교육, 현지 동선 점검, 인솔 인력, 비상 연락망을 포함해 해외 단체 이동 리스크를 줄입니다.",
        points: ["현지 네트워크 기반 운영", "단체 이동 동선 관리", "식사·교통·숙소 사전 검토", "사후 보고 및 자료 정리"],
      },
      {
        title: "학교 예산과 일정에 맞춘 제안",
        body:
          "항공과 선박, 숙소 등급, 지역별 이동 시간을 비교해 학교 예산과 학사 일정에 맞는 현실적인 제안서를 제공합니다.",
        points: ["2박3일-장기 일정 조합", "권역별 코스 비교", "계절·예산별 최적화", "교사연수 연계 가능"],
      },
    ],
    process: ["교육 목표 확인", "지역·테마 선정", "예산·일정 조율", "안전 계획 수립", "최종 제안서 제공"],
    faqs: [
      {
        question: "일본 교육여행은 어느 학년에 적합한가요?",
        answer:
          "중학교와 고등학교 모두 운영할 수 있습니다. 학년, 교과 연계 목표, 학생 수준에 따라 역사·문화 중심 또는 진로·산업 중심으로 조정합니다.",
      },
      {
        question: "학교 교류도 포함할 수 있나요?",
        answer:
          "가능합니다. 교류 희망 지역, 학교 종별, 일정, 교류 내용을 확인한 뒤 현지 학교 또는 기관과의 매칭 가능성을 검토합니다.",
      },
      {
        question: "견적은 언제 받을 수 있나요?",
        answer:
          "희망 지역, 일정, 인원, 예산 범위를 알려주시면 항공·숙소 상황을 반영해 맞춤 견적을 안내합니다.",
      },
    ],
    relatedLinks: [
      { label: "2026 일본 에듀트립 카드뉴스", href: "/news/cardnews_japan_edu_trip_2026" },
      { label: "일본 교육여행 추천 프로그램", href: "/news/cmn648q9p0000duplif3b6tne" },
      { label: "견적 문의", href: "/inquiry" },
    ],
  },
  "school-trip": {
    key: "school-trip",
    path: "/programs/school-trip",
    title: "수학여행·교육여행",
    metaTitle: "수학여행 전문 여행사 | 국내·해외 교육여행 맞춤 기획",
    description:
      "국내외 수학여행, 체험학습, 학교 단체 교육여행을 교육 목표·예산·안전 기준에 맞춰 기획하고 운영합니다.",
    keywords: mergeKeywords(sharedKeywords, [
      "수학여행",
      "수학여행 전문 여행사",
      "교육여행 전문 여행사",
      "학교 단체 여행",
      "체험학습",
    ]),
    eyebrow: "학교 단체 맞춤형 교육여행 파트너",
    lead:
      "터치더월드는 가격표형 여행이 아니라 학교의 교육 목표, 학생 특성, 예산, 안전 기준을 먼저 이해한 뒤 국내외 수학여행과 체험학습을 맞춤 설계합니다.",
    image: "/company-news/touch-the-world-company-introduction-2026/01.webp",
    stats: [
      { label: "협력 학교", value: "1,800+" },
      { label: "교육여행 노하우", value: "28년" },
      { label: "상담", value: "맞춤 견적" },
    ],
    sections: [
      {
        title: "학교별 목적에 맞는 일정",
        body:
          "학습 목표, 학년 특성, 이동 가능 시간, 예산을 기준으로 일정과 방문지를 조합합니다.",
        points: ["국내 수학여행", "해외 교육여행", "체험학습", "진로·문화·역사 테마"],
      },
      {
        title: "안전한 단체 운영",
        body:
          "학생 단체 이동에 필요한 사전 점검, 인솔, 식사·숙소 검토, 비상 상황 대응 흐름을 함께 설계합니다.",
        points: ["사전 답사 및 동선 검토", "인솔자·현지 담당자 배치", "안전교육 자료 제공", "현장 대응 체계"],
      },
      {
        title: "교육 효과를 남기는 사후 관리",
        body:
          "여행 후에도 보고서, 학습 자료, 사진·콘텐츠 정리 등 학교가 활용할 수 있는 결과물을 지원합니다.",
        points: ["사전 학습 자료", "사후 보고", "학부모 안내 자료", "다음 일정 개선 피드백"],
      },
    ],
    process: ["학교 요구사항 확인", "교육 테마 설계", "방문지·숙소 검토", "견적 및 일정 조율", "현장 운영"],
    faqs: [
      {
        question: "수학여행 견적을 받으려면 어떤 정보가 필요한가요?",
        answer:
          "학교명, 예상 인원, 희망 일정, 지역, 예산 범위, 필수 방문지 또는 교육 목표를 알려주시면 빠르게 검토할 수 있습니다.",
      },
      {
        question: "국내와 해외를 모두 상담할 수 있나요?",
        answer:
          "가능합니다. 국내 수학여행, 일본·동남아 등 해외 교육여행, 체험학습과 교류 프로그램까지 목적에 맞춰 안내합니다.",
      },
      {
        question: "학부모 안내용 자료도 받을 수 있나요?",
        answer:
          "일정, 안전관리, 숙소와 식사, 준비물 등 학교가 안내에 활용할 수 있는 자료를 함께 구성합니다.",
      },
    ],
    relatedLinks: [
      { label: "프로그램 카드뉴스", href: "/programs" },
      { label: "회사 소개", href: "/about" },
      { label: "견적 문의", href: "/inquiry" },
    ],
  },
  "teacher-training": {
    key: "teacher-training",
    path: "/programs/teacher-training",
    title: "교직원 연수",
    metaTitle: "교직원 연수 프로그램 | 국내·해외 맞춤 교사연수",
    description:
      "학교 변화와 교사 역량 강화를 위한 국내외 교직원 연수, AI 미래교육 체험, 기관·기업 탐방, 워크숍을 맞춤 운영합니다.",
    keywords: mergeKeywords(sharedKeywords, [
      "교직원 연수",
      "교사연수",
      "국내 교직원 연수",
      "해외 교직원 연수",
      "교원 연수",
    ]),
    eyebrow: "학교 변화를 만드는 경험 중심 연수",
    lead:
      "형식적인 견학이 아니라 교사의 수업과 학교 운영에 다시 연결되는 연수를 설계합니다. 국내외 기관 탐방, AI 미래교육, 워크숍, 힐링형 프로그램을 목적에 맞게 조합합니다.",
    image: "/company-news/teacher-training-domestic-overseas-program/01.webp",
    stats: [
      { label: "연수 유형", value: "국내·해외" },
      { label: "운영 방식", value: "맞춤형" },
      { label: "지원", value: "기획-사후공유" },
    ],
    sections: [
      {
        title: "국내외 목적형 연수",
        body:
          "국내에서는 교육기관·기업·지역 연계 탐방, 해외에서는 선진 교육 사례와 대학·기관 방문을 중심으로 구성합니다.",
        points: ["AI·디지털 전환 연수", "교사 워크숍", "해외 교육 선진 사례", "기관·기업 탐방"],
      },
      {
        title: "현장 적용 중심 프로그램",
        body:
          "보고 끝나는 연수가 아니라 학교 현장에서 적용할 수 있는 아이디어와 자료가 남도록 설계합니다.",
        points: ["강의·체험·토론 혼합", "학교 맞춤 설계", "결과보고 및 콘텐츠 제공", "교직원 만족도 고려"],
      },
      {
        title: "숙소와 동선까지 통합 설계",
        body:
          "교직원 연수의 만족도는 이동 시간, 숙소, 식사, 회의 공간의 품질에 크게 좌우됩니다. 목적과 예산에 맞춰 현실적인 조합을 제안합니다.",
        points: ["수도권 숙소 추천", "전용버스 동선", "워크숍 공간 검토", "식사·휴식 동선 최적화"],
      },
    ],
    process: ["연수 목표 확인", "국내·해외 방향 결정", "숙소·기관 섭외", "세부 일정 조율", "현장 운영 및 사후 공유"],
    faqs: [
      {
        question: "교직원 연수는 최소 몇 명부터 가능한가요?",
        answer:
          "학교 목적과 지역에 따라 다르지만 소규모 워크숍부터 대규모 교직원 연수까지 상담 가능합니다.",
      },
      {
        question: "AI 교육이나 미래교육 연수도 가능한가요?",
        answer:
          "가능합니다. AI·디지털 전환, 미래교육 체험, 기업·기관 탐방을 포함한 프로그램으로 구성할 수 있습니다.",
      },
      {
        question: "숙소 추천도 함께 받을 수 있나요?",
        answer:
          "가능합니다. 서울·경기, 인천, 지방권 등 이동 시간과 워크숍 공간을 고려해 숙소를 비교 제안합니다.",
      },
    ],
    relatedLinks: [
      { label: "국내·외 교직원 연수 카드뉴스", href: "/news/cmn9nw4e300011fdbrgkwo4ja" },
      { label: "서울·경기 교직원 연수 숙소 7선", href: "/news/cardnews_seoul_gyeonggi_teacher_training_accommodations_2026" },
      { label: "견적 문의", href: "/inquiry" },
    ],
  },
  "specialized-highschool": {
    key: "specialized-highschool",
    path: "/programs/specialized-highschool",
    title: "특성화고 글로벌 현장학습",
    metaTitle: "특성화고 글로벌 현장학습 | 전공 맞춤 진로·취업 교육여행",
    description:
      "특성화고 학생을 위한 전공 맞춤형 글로벌 현장학습, 산업체 방문, 직업전문학교 탐방, 해외취업·유학 연계 프로그램을 운영합니다.",
    keywords: mergeKeywords(sharedKeywords, [
      "특성화고 글로벌 현장학습",
      "특성화고 프로그램",
      "특성화고 해외연수",
      "특성화고 일본 현장학습",
      "진로 체험",
    ]),
    eyebrow: "취업과 진로를 연결하는 전공 맞춤 교육여행",
    lead:
      "특성화고 학생에게 필요한 것은 단순 견학이 아니라 전공과 산업 현장, 대학·직업전문학교, 취업 가능성을 연결하는 경험입니다. 터치더월드는 학교 전공에 맞춰 현장 중심 글로벌 프로그램을 설계합니다.",
    image: "/company-news/specialized-highschool-global-field-study-2026/01.webp",
    stats: [
      { label: "핵심 방향", value: "진로·취업" },
      { label: "추천 지역", value: "일본 후쿠오카" },
      { label: "구성", value: "산업체·학교·교류" },
    ],
    sections: [
      {
        title: "전공별 맞춤 현장학습",
        body:
          "관광·호텔, IT·AI, 조리·미용, 디자인, 제조·기계 등 전공별로 방문지와 직무 체험을 다르게 구성합니다.",
        points: ["산업체 방문", "직무 체험", "전문학교 탐방", "취업·유학 특강"],
      },
      {
        title: "글로벌 진로 확장",
        body:
          "일본 대학·전문학교, 현지 기업, 기관 방문을 통해 학생이 해외 진학과 취업 경로를 구체적으로 이해할 수 있게 돕습니다.",
        points: ["일본 취업·유학 연계", "국제교류", "자매고 MOU 검토", "글로벌 역량 강화"],
      },
      {
        title: "교육청 지침과 학교 요구 반영",
        body:
          "학교 예산, 교육청 지침, 학생 안전, 교사 운영 부담을 고려해 실행 가능한 일정으로 조정합니다.",
        points: ["6박7일 등 장기 운영", "전공 맞춤 일정", "안전관리 체계", "사전·사후 학습 연계"],
      },
    ],
    process: ["전공·학과 확인", "진로 목표 설정", "방문 기관 구성", "안전·예산 검토", "현지 운영"],
    faqs: [
      {
        question: "특성화고 전공별로 프로그램을 다르게 만들 수 있나요?",
        answer:
          "가능합니다. 관광, IT, 조리, 미용, 디자인, 제조 등 학과 특성에 따라 산업체와 학교 방문지를 다르게 구성합니다.",
      },
      {
        question: "일본 후쿠오카 외 지역도 가능한가요?",
        answer:
          "가능합니다. 다만 후쿠오카는 이동 시간, 비용, 안전, 산업·교육 인프라 측면에서 특성화고 현장학습에 적합한 지역입니다.",
      },
      {
        question: "해외취업·유학 상담과 연결할 수 있나요?",
        answer:
          "가능합니다. 해외취업·유학 프로그램과 연계해 학생별 진학·취업 경로 상담을 포함할 수 있습니다.",
      },
    ],
    relatedLinks: [
      { label: "특성화고 글로벌 현장학습 카드뉴스", href: "/news/cardnews_specialized_highschool_global_field_study_2026" },
      { label: "특성화고 맞춤 진로 프로그램", href: "/news/cmn9nx6sv00031fdbjuq07tbr" },
      { label: "해외취업·유학 프로그램", href: "/news/cmn9nwop200021fdbfhzjqmnp" },
    ],
  },
};

export const seoLandingPageList = Object.values(seoLandingPages);

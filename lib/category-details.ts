export type IconName = 
  | "MapPin"
  | "BookOpen"
  | "Mountain"
  | "GraduationCap"
  | "Plane"
  | "Building2"
  | "School"
  | "MoreHorizontal"
  | "Globe"
  | "Flag"
  | "Users"
  | "Lightbulb"
  | "Target"
  | "Briefcase"
  | "Heart"
  | "Shield"
  | "Compass"
  | "Handshake"
  | "Award"
  | "FileText"
  | "Sparkles";

export interface CategoryCard {
  id: string;
  title: string;
  description?: string;
  icon?: IconName;
  image?: string;
  details?: string[];
  locations?: string[];
  features?: string[];
}

export interface CategoryFeature {
  icon: IconName;
  text: string;
}

export interface CategoryDetail {
  categoryName: string;
  title: string;
  subtitle?: string;
  description: string;
  cards: CategoryCard[];
  bottomText?: string;
  buttonText?: string;
  features?: CategoryFeature[];
}

export const CATEGORY_DETAILS: Record<string, CategoryDetail> = {
  "국내수학여행": {
    categoryName: "국내수학여행",
    title: "국내수학여행",
    subtitle: "전국 6개 권역 학생 맞춤형 프로그램",
    description: "각 지역의 특색을 살린 교육적 체험을 통해 학생들의 시야를 넓히고 우리나라의 역사와 문화를 깊이 이해하는 의미있는 수학여행을 제공합니다.",
    cards: [
      {
        id: "gyeonggi-incheon",
        title: "경기권(인천)",
        description: "항구 도시의 산업 현장과 문화 유적을 탐방하는 체험 프로그램",
        icon: "MapPin",
        details: ["항구 도시 체험", "산업 현장 탐방", "문화 유적 탐방"]
      },
      {
        id: "gangwon",
        title: "강원권",
        description: "자연 환경과 산악 지역을 활용한 레저 활동 중심 프로그램",
        icon: "Mountain",
        details: ["자연 환경 체험", "산악 지역 탐방", "레저 활동"]
      },
      {
        id: "chungcheong",
        title: "충청권",
        description: "역사 유적과 전통 문화를 체험하는 교육적 가치 중심 프로그램",
        icon: "MapPin",
        details: ["역사 유적 탐방", "전통 문화 체험", "교육적 가치"]
      },
      {
        id: "jeolla",
        title: "전라권",
        description: "전통 문화와 자연 환경을 함께 경험하는 역사 탐방 프로그램",
        icon: "MapPin",
        details: ["전통 문화", "자연 환경", "역사 탐방"]
      },
      {
        id: "busan",
        title: "부산권",
        description: "해양 도시의 문화 유적과 현대 도시를 탐방하는 체험 프로그램",
        icon: "MapPin",
        details: ["해양 도시 체험", "문화 유적", "현대 도시 탐방"]
      },
      {
        id: "jeju",
        title: "제주권",
        description: "독특한 자연 환경과 문화를 경험하는 레저 활동 중심 프로그램",
        icon: "MapPin",
        details: ["자연 환경", "독특한 문화", "레저 활동"]
      },
      {
        id: "ulleung-dokdo",
        title: "울릉도/독도",
        description: "섬 지역의 자연 환경과 역사를 학습하는 교육 프로그램",
        icon: "MapPin",
        details: ["섬 지역 체험", "자연 환경", "역사 교육"]
      }
    ],
    bottomText: "지역별 맞춤 코스 설계 가능"
  },
  "국내외교육여행": {
    categoryName: "국내외 교육여행",
    title: "해외수학여행",
    subtitle: "국내비용으로 가는 해외 체험",
    description: "합리적인 비용으로 글로벌 감각을 키우고 다양한 문화를 직접 체험하는 해외수학여행. 안전한 인솔과 교육적 가치를 동시에 실현합니다.",
    cards: [
      {
        id: "asia-japan",
        title: "일본",
        description: "전통 문화와 현대 도시를 함께 체험하는 안전한 인솔 프로그램",
        icon: "Flag",
        details: ["전통 문화 체험", "현대 도시 탐방", "안전한 인솔"]
      },
      {
        id: "asia-china",
        title: "중국",
        description: "역사 유적 탐방과 현대 중국 이해를 통한 문화 교류 프로그램",
        icon: "Flag",
        details: ["역사 유적 탐방", "현대 중국 이해", "문화 교류"]
      },
      {
        id: "asia-others",
        title: "대만·싱가폴·홍콩",
        description: "아시아 주요 도시의 다양한 문화를 체험하는 안전한 여행 프로그램",
        icon: "Flag",
        details: ["다양한 문화 체험", "안전한 여행 환경", "교육적 가치"]
      },
      {
        id: "europe",
        title: "유럽",
        description: "역사와 문화가 살아있는 다양한 국가를 탐방하는 교육 프로그램",
        icon: "Globe",
        details: ["역사와 문화 탐방", "다양한 국가 체험", "교육적 가치"]
      },
      {
        id: "usa",
        title: "미국",
        description: "영어권 문화 체험과 교육 기관 방문을 통한 글로벌 시야 확장",
        icon: "Globe",
        details: ["영어권 문화 체험", "교육 기관 방문", "글로벌 시야 확장"]
      },
      {
        id: "australia",
        title: "호주",
        description: "자연 환경과 영어권 문화를 함께 경험하는 안전한 여행 프로그램",
        icon: "Globe",
        details: ["자연 환경 체험", "영어권 문화", "안전한 여행"]
      }
    ],
    buttonText: "맞춤형 일정 설계"
  },
  "체험학습": {
    categoryName: "체험학습",
    title: "체험활동",
    subtitle: "안전하고 재미있는 실질적 체험학습",
    description: "단순 관람이 아닌 직접 참여하고 배우는 체험활동으로 학생들의 협동심과 창의성을 키웁니다. 철저한 안전관리로 학부모님도 안심하실 수 있습니다.",
    cards: [
      {
        id: "non-accommodation",
        title: "비숙박형 체험학습",
        description: "당일 체험으로 시간 효율적인 학습 경험을 제공합니다",
        icon: "BookOpen",
        details: ["당일 체험 프로그램", "안전한 일정 관리", "교육적 가치"]
      },
      {
        id: "accommodation",
        title: "숙박형 체험학습",
        description: "1박2일 숙박을 통한 심화 체험 학습과 협동심 함양",
        icon: "BookOpen",
        details: ["1박2일 프로그램", "심화 체험 학습", "협동심 함양"]
      },
      {
        id: "special-events",
        title: "특별 행사",
        description: "학교 행사를 위한 맞춤형 프로그램으로 기억에 남는 경험 제공",
        icon: "Sparkles",
        details: ["학교 행사 지원", "맞춤형 프로그램", "기억에 남는 경험"]
      }
    ],
    bottomText: "철저한 안전관리로 학부모님도 안심하실 수 있습니다"
  },
  "수련활동": {
    categoryName: "수련활동",
    title: "수련활동",
    subtitle: "형식적인 수련활동을 거부합니다",
    description: "의미없는 반복적 프로그램 대신, 학생들이 진정으로 성장하고 팀워크를 배울 수 있는 실질적인 수련활동을 제공합니다. 아름다운 자연 환경에서 자기주도성과 협력의 가치를 체득하는 특별한 경험",
    cards: [
      {
        id: "phoenix-park",
        title: "휘닉스파크",
        description: "자연 속에서 자기주도성과 팀워크, 리더십을 기르는 수련 프로그램",
        icon: "Mountain",
        details: ["자기주도성", "팀워크", "리더십"]
      },
      {
        id: "petite-france",
        title: "쁘띠프랑스",
        description: "문화와 자연이 어우러진 환경에서 협력과 창의성을 키우는 수련",
        icon: "Mountain",
        details: ["협력의 가치", "창의성", "성장 경험"]
      }
    ],
    features: [
      { icon: "Compass", text: "자기주도성" },
      { icon: "Handshake", text: "팀워크" },
      { icon: "Award", text: "리더십" }
    ],
    bottomText: "실속있는 프로그램 구성"
  },
  "교사연수": {
    categoryName: "교사 연수",
    title: "교사연수",
    subtitle: "불참하면 아쉬운 실무형 연수",
    description: "형식적인 의무연수가 아닌, 실제 교육현장에서 바로 활용할 수 있는 실무 중심 내용으로 구성됩니다. 참여하신 선생님들의 높은 만족도를 자랑합니다.",
    cards: [
      {
        id: "teacher-training",
        title: "교사연수",
        description: "교수법과 학생지도 역량을 강화하는 실무 중심 연수 프로그램",
        icon: "GraduationCap",
        details: ["실무 중심 교육", "즉시 활용 가능", "역량 강화"]
      },
      {
        id: "department-head",
        title: "부장연수",
        description: "리더십 개발과 부서 운영 노하우를 습득하는 실무형 연수",
        icon: "Users",
        details: ["리더십 개발", "부서 운영", "실무 노하우"]
      },
      {
        id: "principal",
        title: "교장·교감 연수",
        description: "학교 경영 전략과 비전 수립을 위한 리더십 연수 프로그램",
        icon: "Briefcase",
        details: ["경영 전략", "비전 수립", "학교 발전"]
      },
      {
        id: "admin",
        title: "행정실 연수",
        description: "행정 업무 역량 강화와 입학시험 출제 전문성을 기르는 연수",
        icon: "FileText",
        details: ["행정 업무", "입학시험 출제", "실무 역량"]
      }
    ],
    bottomText: "현장 맞춤형 커리큘럼"
  },
  "해외취업및유학": {
    categoryName: "해외 취업 및 유학",
    title: "해외 유학 및 취업 프로그램",
    subtitle: "글로벌 진로의 새로운 길을 열다",
    description: "학생들의 글로벌 진로를 체계적으로 지원합니다. 유학 준비부터 현지 정착까지 단계별 멘토링을 통해 성공적인 해외 진출을 돕습니다. 검증된 파트너 기관과의 협력으로 안전하고 확실한 기회를 제공합니다.",
    cards: [
      {
        id: "japan",
        title: "일본 진출",
        description: "일본 유학부터 취업까지 단계별 멘토링을 통한 체계적 지원",
        icon: "Flag",
        details: ["일본 유학 지원", "취업 기회 제공", "단계별 멘토링"]
      },
      {
        id: "english-speaking",
        title: "영어권 진출",
        description: "영어권 유학과 글로벌 취업을 위한 검증된 파트너 기관 연계",
        icon: "Globe",
        details: ["영어권 유학", "글로벌 취업", "검증된 파트너"]
      }
    ],
    buttonText: "전문 상담 제공"
  },
  "지자체및대학RISE사업": {
    categoryName: "지자체 및 대학 RISE 사업",
    title: "지자체 및 대학 RISE 사업",
    description: "지자체와 대학을 위한 맞춤형 프로그램을 제공합니다.",
    cards: [
      {
        id: "local-government",
        title: "지자체 프로그램",
        description: "지역 특성에 맞는 맞춤형 교육 프로그램으로 교육 목표 달성",
        icon: "Building2",
        details: ["지역 맞춤형", "교육 목표 달성", "체계적 운영"]
      },
      {
        id: "university-rise",
        title: "대학 RISE 사업",
        description: "대학생을 위한 전문 프로그램으로 RISE 사업 성과 창출 지원",
        icon: "School",
        details: ["RISE 사업 지원", "전문 프로그램", "성과 창출"]
      }
    ]
  },
  "특성화고교프로그램": {
    categoryName: "특성화고교 프로그램",
    title: "특성화고교 프로그램",
    description: "특성화고등학교를 위한 전문 프로그램을 제공합니다.",
    cards: [
      {
        id: "specialized-high",
        title: "특성화고 프로그램",
        description: "전문 분야별 맞춤형 교육으로 실무 역량 강화와 진로 지원",
        icon: "School",
        details: ["전문 분야 연계", "실무 중심", "진로 지원"]
      }
    ]
  },
  "기타프로그램": {
    categoryName: "기타 프로그램",
    title: "특별 프로그램",
    subtitle: "형식적인 프로그램은 거부합니다",
    description: "학생들에게 정말 필요하고 실질적인 도움이 되는 프로그램만을 엄선했습니다. 단순 이수가 아닌 실제 역량 향상과 인성 함양을 목표로 합니다. 시대가 요구하는 미래형 인재 양성",
    cards: [
      {
        id: "reading-writing",
        title: "책읽기·책쓰기",
        description: "독서 능력과 작문 실력을 향상시켜 문해력을 강화하는 프로그램",
        icon: "BookOpen",
        details: ["독서 능력 향상", "작문 실력 개발", "문해력 강화"]
      },
      {
        id: "humanities",
        title: "인문학 특강",
        description: "인문학적 사고와 비판적 사고력을 기르는 교양 함양 프로그램",
        icon: "Lightbulb",
        details: ["인문학적 사고", "비판적 사고력", "교양 함양"]
      },
      {
        id: "leadership",
        title: "리더십 캠프",
        description: "리더십 개발과 협력 능력, 의사소통 역량을 키우는 캠프 프로그램",
        icon: "Award",
        details: ["리더십 개발", "협력 능력", "의사소통"]
      },
      {
        id: "ai",
        title: "AI 특강",
        description: "AI 이해와 미래 기술을 학습하여 디지털 리터러시를 강화하는 특강",
        icon: "Sparkles",
        details: ["AI 이해", "미래 기술", "디지털 리터러시"]
      },
      {
        id: "career",
        title: "진로 프로그램",
        description: "진로 탐색과 직업 이해를 통해 미래를 설계하는 진로 상담 프로그램",
        icon: "Compass",
        details: ["진로 탐색", "직업 이해", "미래 설계"]
      },
      {
        id: "table-manners",
        title: "테이블매너",
        description: "예절 교육과 사회성 함양, 문화 이해를 위한 매너 교육 프로그램",
        icon: "Users",
        details: ["예절 교육", "사회성 함양", "문화 이해"]
      },
      {
        id: "capstone",
        title: "캡스톤 디자인",
        description: "프로젝트 기반 학습을 통해 실무 역량과 창의성을 기르는 프로그램",
        icon: "Target",
        details: ["프로젝트 기반 학습", "실무 역량", "창의성"]
      },
      {
        id: "startup",
        title: "창업·스타트업",
        description: "창업 정신과 혁신 사고, 실행력을 기르는 창업 교육 프로그램",
        icon: "Briefcase",
        details: ["창업 정신", "혁신 사고", "실행력"]
      },
      {
        id: "violence-prevention",
        title: "학폭예방",
        description: "안전한 학교 환경 조성을 위한 인성 교육과 상호 존중 프로그램",
        icon: "Shield",
        details: ["안전한 학교", "인성 교육", "상호 존중"]
      }
    ],
    buttonText: "맞춤형 프로그램 설계"
  }
};


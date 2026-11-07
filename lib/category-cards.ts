import { PROGRAM_CATEGORIES } from "@/lib/news-constants";

// name 순서는 PROGRAM_CATEGORIES(lib/news-constants.ts)와 반드시 동일해야 함 —
// href를 그 값에서 그대로 파생시키므로 순서가 어긋나면 카드가 다른 카테고리로 연결됨.
export const CATEGORY_CARDS = [
  {
    name: "국내 교육여행",
    title: "국내 곳곳을 누비는\n교육여행",
    description: "인천·충남·포천 등 국내 주요 지역에서 학교 교육 목표에 맞춰 전 일정을 기획·운영합니다.",
    image: "/images/new/category-domestic-edu.webp",
  },
  {
    name: "일본 교육여행",
    title: "가까운 일본에서 만나는\n교육여행·수학여행",
    description: "후쿠오카·오사카·교토·규슈 수학여행부터 한일 학교 교류까지, 국내 비용대 일정도 설계합니다.",
    image: "/images/new/category-japan-trip.webp",
  },
  {
    name: "해외 교육여행",
    title: "배움이 넓어지는\n해외 교육여행",
    description: "미국 명문대·실리콘밸리, 유럽, 뉴질랜드 영어캠프 등 글로벌 감각을 키우는 프로그램입니다.",
    image: "/images/new/category-overseas-edu.webp",
  },
  {
    name: "체험학습",
    title: "손으로 배우고 몸으로 느끼는\n현장 체험학습",
    description: "교과와 연계된 역사·과학·문화 체험으로 교실 밖 살아있는 학습을 경험합니다.",
    image: "/images/new/category-field-learning.webp",
  },
  {
    name: "수련활동",
    title: "자연 속에서 단련하는\n협동과 도전의 힘",
    description: "국립청소년시설·수련원에서 팀워크와 자립심을 키우는 협동·도전 프로그램입니다.",
    image: "/images/new/category-training-camp.webp",
  },
  {
    name: "교직원 연수·혜택",
    title: "선생님을 위한\n연수와 여행 혜택",
    description: "국내외 교직원 연수와 숙소, 교사·교직원 가족을 위한 제휴 여행 혜택을 안내합니다.",
    image: "/images/new/category-teacher-training.webp",
  },
  {
    name: "특성화고 프로그램",
    title: "현장에서 완성되는\n나만의 직업 역량",
    description: "전공 연계 교육여행, 글로벌 현장학습, 취업 캠프로 진로 역량을 완성합니다.",
    image: "/images/new/category-vocational.webp",
  },
  {
    name: "일본 유학",
    title: "글로벌 무대로\n나아가는 일본 유학",
    description: "일본 전문학교·고등학교 진학과 취업 연계로 학생의 글로벌 진로를 지원합니다.",
    image: "/images/new/category-japan-study.webp",
  },
] satisfies { name: (typeof PROGRAM_CATEGORIES)[number]; title: string; description: string; image: string }[];


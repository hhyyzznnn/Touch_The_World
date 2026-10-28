import {
  MapPin,
  Globe,
  BookOpen,
  Mountain,
  GraduationCap,
  Plane,
  School,
  Landmark,
  LucideIcon
} from "lucide-react";
import { PROGRAM_CATEGORIES as CATEGORY_NAMES, type ProgramCategory as CategoryName } from "./news-constants";

export const PROGRAM_CATEGORY_GROUPS = ["국내외 교육여행", "해외유학"] as const;
export type ProgramCategoryGroup = (typeof PROGRAM_CATEGORY_GROUPS)[number];

export interface ProgramCategory {
  name: CategoryName;
  icon: LucideIcon;
  href: string;
  group: ProgramCategoryGroup;
}

const CATEGORY_ICONS: Record<CategoryName, LucideIcon> = {
  "국내 교육여행": MapPin,
  "일본 교육여행": Landmark,
  "해외 교육여행": Globe,
  "체험학습": BookOpen,
  "수련활동": Mountain,
  "교직원 연수·혜택": GraduationCap,
  "특성화고 프로그램": School,
  "일본 유학": Plane,
};

// 이름 목록은 lib/news-constants.ts 한 곳에서만 관리하고, 메뉴·버튼용 정보는 여기서 붙인다.
export const PROGRAM_CATEGORIES: ProgramCategory[] = CATEGORY_NAMES.map((name) => ({
  name,
  icon: CATEGORY_ICONS[name],
  href: `/programs?category=${encodeURIComponent(name)}`,
  group: name === "일본 유학" ? "해외유학" : "국내외 교육여행",
}));

// 창립연도 기준 업력(연차). 화면 곳곳(About, 홈 통계, SEO 랜딩페이지)에서 하드코딩된
// 숫자("28년" 등)가 해마다 그대로 남아 실제 연차와 어긋나는 걸 막기 위해 여기서 한 번만 계산한다.
export const FOUNDED_YEAR = 1996;
export const YEARS_OF_EXPERIENCE = new Date().getFullYear() - FOUNDED_YEAR;

export const COMPANY_INFO = {
  name: "주식회사 터치더월드",
  englishName: "Touch The World",
  registrationNumber: "204-81-51250",
  representative: "박정주",
  established: "2000년 03월 16일",
  founded: "1996년",
  businessType: "종합여행업, 유학 및 교육",
  address: "서울특별시 강남구 테헤란로 501 삼성동 브이플렉스",
  phone: "1800-8078",
  email: "pjjttw@naver.com",
  businessHours: "평일 09:00 - 18:00 (점심시간 12:00 - 13:00)",
  kakaoChannel: "https://pf.kakao.com/_xoxixkPn/chat", // 카카오톡 채널 링크 (채팅 진입 URL)
  instagram: "https://www.instagram.com/touch_tw_ai",
  facebook: "https://www.facebook.com/profile.php?id=61594076981446", // 터치더월드 공식 페이지(2026.09 신규 개설)
  youtube: "https://www.youtube.com/@ttw_ai",
} as const;

import {
  MapPin,
  Globe,
  BookOpen,
  Mountain,
  GraduationCap,
  Plane,
  School,
  MoreHorizontal,
  LucideIcon
} from "lucide-react";

export interface ProgramCategory {
  name: string;
  icon: LucideIcon;
  href: string;
}

export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  { name: "국내 교육여행",          icon: MapPin,        href: "/programs?category=국내교육여행" },
  { name: "국외 교육여행",          icon: Globe,         href: "/programs?category=국외교육여행" },
  { name: "체험학습\n(숙박형, 비숙박형)", icon: BookOpen, href: "/programs?category=체험학습" },
  { name: "수련활동",               icon: Mountain,      href: "/programs?category=수련활동" },
  { name: "교사 연수",              icon: GraduationCap, href: "/programs?category=교사연수" },
  { name: "일본 유학",              icon: Plane,         href: "/programs?category=일본유학" },
  { name: "특성화고교 프로그램",    icon: School,        href: "/programs?category=특성화고교프로그램" },
  { name: "기타 프로그램",          icon: MoreHorizontal,href: "/programs?category=기타프로그램" },
];

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
  instagram: "https://www.instagram.com/touch_tw",
  facebook: "https://www.facebook.com/pjjttw",
  youtube: "https://www.youtube.com/@%EB%B0%95%EC%A0%95%EC%A3%BC-o4x",
} as const;

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "회사 소개", href: "/about" },
  { name: "사업 실적", href: "/achievements" },
  { name: "견적 문의", href: "/inquiry" },
] as const;

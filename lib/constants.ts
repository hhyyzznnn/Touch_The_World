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
  { name: "국내 교육여행",          icon: MapPin,        href: "/programs?category=%EA%B5%AD%EB%82%B4%20%EA%B5%90%EC%9C%A1%EC%97%AC%ED%96%89" },
  { name: "국외 교육여행",          icon: Globe,         href: "/programs?category=%EA%B5%AD%EC%99%B8%20%EA%B5%90%EC%9C%A1%EC%97%AC%ED%96%89" },
  { name: "체험학습\n(숙박형, 비숙박형)", icon: BookOpen, href: "/programs?category=%EC%B2%B4%ED%97%98%ED%95%99%EC%8A%B5" },
  { name: "수련활동",               icon: Mountain,      href: "/programs?category=%EC%88%98%EB%A0%A8%ED%99%9C%EB%8F%99" },
  { name: "교사 연수",              icon: GraduationCap, href: "/programs?category=%EA%B5%90%EC%82%AC%20%EC%97%B0%EC%88%98" },
  { name: "일본 유학",              icon: Plane,         href: "/programs?category=%EC%9D%BC%EB%B3%B8%20%EC%9C%A0%ED%95%99" },
  { name: "특성화고 프로그램",      icon: School,        href: "/programs?category=%ED%8A%B9%EC%84%B1%ED%99%94%EA%B3%A0%20%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8" },
  { name: "기타 프로그램",          icon: MoreHorizontal,href: "/programs?category=%EA%B8%B0%ED%83%80%20%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8" },
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
  youtube: "https://www.youtube.com/@ttw_ai",
} as const;

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "회사 소개", href: "/about" },
  { name: "사업 실적", href: "/achievements" },
  { name: "견적 문의", href: "/inquiry" },
] as const;

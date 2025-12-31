import { 
  MapPin,
  BookOpen,
  Mountain, 
  GraduationCap, 
  Plane, 
  Building2, 
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
  { name: "국내외 교육여행", icon: MapPin, href: "/programs?category=국내외교육여행" },
  { name: "체험학습\n(숙박형, 비숙박형)", icon: BookOpen, href: "/programs?category=체험학습" },
  { name: "수련활동", icon: Mountain, href: "/programs?category=수련활동" },
  { name: "교사 연수", icon: GraduationCap, href: "/programs?category=교사연수" },
  { name: "해외 취업 및 유학", icon: Plane, href: "/programs?category=해외취업및유학" },
  { name: "지자체 및 대학 RISE 사업", icon: Building2, href: "/programs?category=지자체및대학RISE사업" },
  { name: "특성화고교 프로그램", icon: School, href: "/programs?category=특성화고교프로그램" },
  { name: "기타 프로그램", icon: MoreHorizontal, href: "/programs?category=기타프로그램" },
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
  email: "syh2123@naver.com",
  businessHours: "평일 09:00 - 18:00 (점심시간 12:00 - 13:00)",
  kakaoChannel: "", // 카카오톡 채널 링크를 여기에 입력하세요 (예: https://pf.kakao.com/_xxxxx 또는 카카오톡 채널 ID)
  instagram: "https://www.instagram.com/touch_tw", // 인스타그램 링크
  facebook: "https://www.facebook.com/pjjttw", // 페이스북 링크
} as const;

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "회사 소개", href: "/about" },
  { name: "사업 실적", href: "/achievements" },
  { name: "견적 문의", href: "/inquiry" },
] as const;
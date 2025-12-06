import { 
  Bus, 
  Mountain, 
  Plane, 
  Briefcase, 
  GraduationCap, 
  Globe,
  LucideIcon
} from "lucide-react";

export interface ProgramCategory {
  name: string;
  icon: LucideIcon;
  href: string;
}

export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  { name: "수학여행", icon: Bus, href: "/programs?category=수학여행" },
  { name: "수련활동", icon: Mountain, href: "/programs?category=수련활동" },
  { name: "현장 체험학습", icon: Briefcase, href: "/programs?category=현장체험학습" },
  { name: "교육연수(교사/학생)", icon: GraduationCap, href: "/programs?category=교육연수" },
  { name: "해외탐방/유학", icon: Plane, href: "/programs?category=해외탐방" },
  { name: "진로 특강/교육행사", icon: Globe, href: "/programs?category=진로특강" },
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
  facebook: "https://www.facebook.com/", // 페이스북 링크
} as const;

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "회사 소개", href: "/about" },
  { name: "사업 실적", href: "/achievements" },
  { name: "견적 문의", href: "/inquiry" },
] as const;
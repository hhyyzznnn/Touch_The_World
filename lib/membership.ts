/**
 * 교사 멤버십 — reports/1013_교사멤버십서비스기획안 기준.
 * 1단계(기본)는 무료로 지금 열고, 플러스·프리미엄은 결제 없이 "시범 운영 참여 희망"만 받는다.
 * 요금·횟수는 시범 운영 반응을 보고 확정한다(기획안 8장 추진 순서 4).
 */

export const MEMBERSHIP_INTERESTS = [
  "지원사업·예산",
  "맞춤 견적·기획",
  "업무 자료",
  "교류·진로",
  "교직원 연수·여행",
  "행사 케어",
] as const;
export type MembershipInterest = (typeof MEMBERSHIP_INTERESTS)[number];

export const MEMBERSHIP_POSITIONS = ["담임·교과 교사", "부장교사", "교감·교장", "행정실", "기타"] as const;
export const MEMBERSHIP_SCHOOL_LEVELS = ["초등학교", "중학교", "고등학교", "특성화고", "대학교/기관"] as const;

export interface MembershipBundle {
  key: MembershipInterest;
  basis: string;
  items: { name: string; desc: string; tier: 1 | 2 | 3 }[];
}

/** 혜택 묶음 — tier는 해당 혜택이 시작되는 단계 (1 기본 · 2 플러스 · 3 프리미엄) */
export const MEMBERSHIP_BUNDLES: MembershipBundle[] = [
  {
    key: "지원사업·예산",
    basis: "포천·인천 버스비, 국립청소년시설 사전예약, 국제화사업",
    items: [
      { name: "지원사업 마감 알림", desc: "버스비 지원·사전예약·보조금 공모를 마감 전에 이메일로 안내", tier: 1 },
      { name: "연간 지원사업 캘린더", desc: "학년도 초, 우리 학교가 신청할 수 있는 사업 일정표", tier: 2 },
      { name: "지원사업 신청서 작성 지원", desc: "신청 대상·기간·서류 확인부터 신청서 초안까지", tier: 3 },
    ],
  },
  {
    key: "맞춤 견적·기획",
    basis: "국내·국외 교육여행, 체험학습, 수련활동",
    items: [
      { name: "AI 가견적", desc: "AI 상담으로 대략적인 일정과 비용을 바로 확인", tier: 1 },
      { name: "지역·시설 비교표", desc: "인천·충남·포천·가평, 국립청소년시설을 인원·이동시간·비용으로 비교", tier: 2 },
      { name: "다음 학년도 우선 상담", desc: "성수기 날짜·숙소를 일반 문의보다 먼저 상담", tier: 2 },
      { name: "학교 서식 맞춤 견적", desc: "비교견적 서류를 학교 서식에 맞춰 작성", tier: 3 },
    ],
  },
  {
    key: "업무 자료",
    basis: "선생님 업무 지원 가이드, 사전교육, 안전 매뉴얼",
    items: [
      { name: "월간 교육여행 소식", desc: "신규 프로그램·지원사업·추천 도서를 월 1회 정리해 발송", tier: 1 },
      { name: "서류·안전 양식집", desc: "가정통신문·계획서·품의서·사전답사 보고서·정산 양식", tier: 1 },
      { name: "안전 자료", desc: "안전 점검 체크리스트·비상연락망 양식·여행자보험 안내·사고 대응 절차", tier: 1 },
      { name: "학생 사전교육 자료", desc: "해외 교육여행 기초 회화·문화·에티켓·안전 자료와 활동지", tier: 2 },
      { name: "우리 학교용 완성본", desc: "양식에 학교 일정·인원을 넣어 완성본으로 제공", tier: 3 },
    ],
  },
  {
    key: "교류·진로",
    basis: "특성화고 프로그램, 일본 유학, 한일 교류 매칭, 미국대학 진학",
    items: [
      { name: "진로·유학 상담 연결", desc: "학생 개별 진학 상담을 제휴 기관으로 연결", tier: 2 },
      { name: "국제화사업 계획서 지원", desc: "특성화고 국제화사업·글로벌 현장학습 계획서 초안", tier: 3 },
      { name: "한일 학교 교류 우선 매칭", desc: "교류 희망 학교 연결을 회원 학교부터 진행", tier: 3 },
      { name: "학교 방문 진로 설명회", desc: "일본 유학·미국대학 진학 설명회 연 1회", tier: 3 },
    ],
  },
  {
    key: "교직원 연수·여행",
    basis: "교직원 연수, 하나투어 제휴, 교사 특별여행",
    items: [
      { name: "교직원 제휴 혜택 안내", desc: "교직원 누구나 이용할 수 있는 하나투어 제휴 혜택 안내", tier: 1 },
      { name: "AI 활용 온라인 연수", desc: "계획서·가정통신문을 AI로 쓰는 법, 분기 1회", tier: 2 },
      { name: "교직원 연수 기획 패키지", desc: "일정표 + 숙소 비교표 + 품의서 초안", tier: 3 },
    ],
  },
  {
    key: "행사 케어",
    basis: "과천여고·안양문화고·정화여중 진행 사례",
    items: [
      { name: "상담·견적 이력 저장", desc: "지난 상담과 견적을 '내 문의'에서 언제든 다시 확인", tier: 1 },
      { name: "행사 결과 요약 카드", desc: "행사 사진으로 학교 홈페이지·소식지용 카드 1장", tier: 2 },
      { name: "결과보고서·만족도 설문", desc: "학생 만족도 집계와 결과보고서 초안", tier: 3 },
      { name: "전담 담당자·사전답사 지원", desc: "준비부터 정산까지 한 사람이 담당, 사전답사 동행", tier: 3 },
    ],
  },
];

/** 단계 카드에 보여줄 대표 혜택 4개씩 — 전체 목록은 MEMBERSHIP_BUNDLES */
export const MEMBERSHIP_TIERS = [
  {
    tier: 1 as const,
    name: "기본",
    status: "지금 가입 가능",
    headline: "무료",
    target: "교육여행을 맡은 모든 선생님",
    price: "가입비·이용료 없음",
    keyBenefits: ["지원사업 마감 알림", "서류·안전 양식집", "AI 가견적", "월간 교육여행 소식"],
    includes: null,
  },
  {
    tier: 2 as const,
    name: "플러스",
    status: "체험단 모집",
    headline: "담당 선생님용",
    target: "준비 시간을 줄여 주는 자료와 비교표",
    price: "체험단 우선 이용",
    keyBenefits: ["연간 지원사업 캘린더", "지역·시설 비교표", "학생 사전교육 자료", "다음 학년도 우선 상담"],
    includes: "기본 혜택 포함",
  },
  {
    tier: 3 as const,
    name: "프리미엄",
    status: "체험단 모집",
    headline: "학교 단위",
    target: "담당자가 바뀌어도 학교가 계속 이용",
    price: "체험단 우선 이용",
    keyBenefits: ["지원사업 신청서 작성 지원", "학교 서식 맞춤 견적", "국제화사업 계획서 지원", "전담 담당자·사전답사 지원"],
    includes: "플러스 혜택 포함",
  },
];

export interface MembershipInput {
  name: string;
  schoolName: string;
  position: string | null;
  schoolLevel: string | null;
  email: string;
  phone: string | null;
  interests: MembershipInterest[];
  pilotInterest: boolean;
  newsletterOptIn: boolean;
}

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[<>]/g, "").trim().slice(0, max) : "";

/** 가입 폼 값 검증 — 오류가 있으면 { error }, 없으면 { data } */
export function parseMembershipInput(body: unknown): { data: MembershipInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "입력값이 올바르지 않습니다." };
  const b = body as Record<string, unknown>;
  if (b.privacyConsent !== true) return { error: "개인정보 수집·이용에 동의해주세요." };

  const name = clean(b.name, 50);
  const schoolName = clean(b.schoolName, 100);
  const email = clean(b.email, 254).toLowerCase();
  const phone = clean(b.phone, 20).replace(/[^0-9-]/g, "");
  if (!name) return { error: "이름을 입력해주세요." };
  if (!schoolName) return { error: "학교(기관)명을 입력해주세요." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "올바른 이메일을 입력해주세요." };

  const position = clean(b.position, 30);
  const schoolLevel = clean(b.schoolLevel, 30);
  const interests = Array.isArray(b.interests)
    ? MEMBERSHIP_INTERESTS.filter((i) => (b.interests as unknown[]).includes(i))
    : [];

  return {
    data: {
      name,
      schoolName,
      position: (MEMBERSHIP_POSITIONS as readonly string[]).includes(position) ? position : null,
      schoolLevel: (MEMBERSHIP_SCHOOL_LEVELS as readonly string[]).includes(schoolLevel) ? schoolLevel : null,
      email,
      phone: phone || null,
      interests,
      pilotInterest: b.pilotInterest === true,
      newsletterOptIn: b.newsletterOptIn === true,
    },
  };
}

/**
 * 사이트 안에서 멤버십 페이지로 들어온 자리 — 링크에 ?from=<key>를 붙이고 가입 때 함께 저장한다.
 * (외부 유입 경로는 lib/attribution.ts가 따로 기록)
 */
export const MEMBERSHIP_ENTRY_POINTS = {
  home_banner: "메인 배너",
  header_menu: "상단 메뉴",
} as const;
export type MembershipEntryPoint = keyof typeof MEMBERSHIP_ENTRY_POINTS;

export function parseEntryPoint(value: unknown): MembershipEntryPoint | null {
  return typeof value === "string" && value in MEMBERSHIP_ENTRY_POINTS ? (value as MembershipEntryPoint) : null;
}

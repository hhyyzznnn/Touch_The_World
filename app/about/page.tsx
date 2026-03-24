import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Compass,
  Globe,
  GraduationCap,
  Handshake,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  Mountain,
  Phone,
  Plane,
  School,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO } from "@/lib/constants";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "회사 소개 | 터치더월드",
  description:
    "(주)터치더월드는 학교·기관·지자체를 위한 교육여행 전문 파트너입니다. 1996년부터 축적한 운영 노하우로 맞춤형 교육 프로그램을 설계·운영합니다.",
  keywords: mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS, [
    "회사 소개",
    "교육여행 전문기업",
    "학교 맞춤 프로그램",
    "기관 연수",
  ]),
  alternates: {
    canonical: "/about",
  },
};

const CONTACT = {
  name: "(주)터치더월드",
  englishName: "Touch The World",
  message: "학생이 세상과 연결되는 교육",
  phone: "1800-8078",
  email: "syh2123@naver.com",
  website: "www.touchtheworld.co.kr",
};

const ceo = {
  name: "박정주",
  title: "CEO 대표이사",
  tagline: "대한민국 교육여행의 새로운 기준을 제시하는 리더",
  education: [
    "한국외국어대학교 졸업",
    "경희대학교 관광대학원",
    "서울미디어대학원대학교 석사",
  ],
  experience: [
    "교육여행 전문가 (해외수학여행 최초 기획자)",
    "유학원 원장",
    "대학 겸임교수",
    "저서: 청소년을 위한 스타트업",
  ],
  awards: ["2025 인천시장상", "2004 비짓재팬캠페인 이사장상", "2004 VJCO 이사장 표창"],
};

const history = [
  { year: "1996", detail: "Touch the World 유학센터 설립" },
  { year: "2000", detail: "(주)터치더월드 법인 전환" },
  { year: "2004", detail: "일본 비짓재팬캠페인 이사장상 수상" },
  { year: "2012", detail: "하나투어 전문판매점 계약" },
  { year: "2018", detail: "일본 대학 독점 사무소 운영, 스쿨트립 공동 창업" },
  { year: "2025", detail: "교육여행부문 인천시장상 수상" },
];

const missions = [
  {
    title: "성장과 진로 탐색",
    description: "청소년의 올바른 성장과 미래 진로 탐색을 돕는 교육 프로그램을 개발합니다.",
  },
  {
    title: "다채로운 교육 경험",
    description: "국내외 수학여행, AI 교육, 국제교류 등 폭넓고 다양한 교육 기회를 제공합니다.",
  },
  {
    title: "전문적 운영 시스템",
    description: "검증된 운영 시스템과 전문 인력을 통해 안정적이고 효과적인 교육 환경을 구축합니다.",
  },
  {
    title: "맞춤형 솔루션",
    description: "학교와 학생, 기관의 요구를 반영한 최적화된 맞춤형 교육 솔루션을 제공합니다.",
  },
];

const services = [
  { title: "국내외 교육여행", icon: MapPin },
  { title: "체험학습", icon: BookOpen },
  { title: "수련활동", icon: Mountain },
  { title: "교사 연수", icon: GraduationCap },
  { title: "해외 취업 및 유학", icon: Plane },
  { title: "지자체/대학 RISE", icon: Building2 },
  { title: "특성화고 프로그램", icon: School },
  { title: "기타 프로그램", icon: Sparkles },
];

const strengths = [
  {
    title: "28년의 신뢰와 경험",
    description: "장기 운영 경험을 바탕으로 현장 리스크를 선제적으로 관리합니다.",
    icon: Shield,
  },
  {
    title: "교육여행 전문 인력",
    description: "교육 목적 이해도가 높은 전담 인력이 기획부터 운영까지 함께합니다.",
    icon: Users,
  },
  {
    title: "학교/기관 맞춤 설계",
    description: "학교와 테마 특성에 맞춰 프로그램 구조를 유연하게 설계합니다.",
    icon: Handshake,
  },
  {
    title: "안정된 운영 시스템",
    description: "사전 점검, 운영 매뉴얼, 현장 대응, 사후 공유까지 체계화했습니다.",
    icon: Settings,
  },
  {
    title: "폭넓은 네트워크",
    description: "학교, 지자체, 대학, 해외 기관과의 협력 기반으로 실행력을 높입니다.",
    icon: Compass,
  },
  {
    title: "미래지향 프로그램",
    description: "AI 교육, 글로벌 진로 중심 콘텐츠로 교육 현장의 변화에 대응합니다.",
    icon: Lightbulb,
  },
];

const trustStats = [
  { label: "누적 협력 학교", value: "1,800+" },
  { label: "교육여행 노하우", value: "28 Years" },
  { label: "수상", value: "2025 인천시장상" },
  { label: "설립", value: "1996" },
];

const achievements = [
  "하나투어 전문판매점 계약",
  "일본 야마나시가쿠인대학 독점 사무소",
  "스쿨트립 공동 창업",
  "AI 기반 교육 플랫폼",
];

function resolveKakaoUrl() {
  const raw =
    process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ||
    process.env.KAKAO_CHANNEL_URL ||
    COMPANY_INFO.kakaoChannel;

  const value = raw?.trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  return `https://pf.kakao.com/_${value.replace(/^_+/, "")}`;
}

function SectionTitle({ label, title, desc }: { label: string; title: string; desc: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold text-brand-green">{label}</p>
      <h2 className="mt-2 break-keep text-2xl font-semibold text-text-dark sm:text-3xl">{title}</h2>
      <p className="mt-3 break-keep text-sm leading-relaxed text-text-gray sm:text-base">{desc}</p>
    </div>
  );
}

export default function AboutPage() {
  const kakaoUrl = resolveKakaoUrl();

  return (
    <div className="bg-gradient-to-b from-brand-green/5 via-white to-white">
      <section className="border-b border-brand-green/10 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-brand-green/20 bg-white px-4 py-1.5 text-sm font-medium text-brand-green">
                학교·기관·지자체를 위한 교육 프로그램 파트너
              </p>
              <h1 className="mt-5 break-keep text-3xl font-semibold leading-tight text-text-dark sm:text-5xl">
                {CONTACT.name}
                <br className="hidden sm:block" />
                <span className="text-brand-green-primary">{CONTACT.message}</span>
              </h1>
              <p className="mt-5 max-w-2xl break-keep text-sm leading-relaxed text-text-gray sm:text-lg">
                터치더월드는 단순 여행사가 아니라 교육 성과를 함께 만드는 운영 파트너입니다.
                학교와 기관의 목표를 이해하고 기획부터 현장 운영, 사후 관리까지 일관되게 지원합니다.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-brand-green-primary hover:bg-brand-green-primary/90">
                  <Link href="/inquiry" className="inline-flex items-center gap-2">
                    프로그램 문의하기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {kakaoUrl ? (
                  <Button asChild size="lg" variant="outline" className="border-brand-green/30 text-brand-green hover:bg-brand-green/5">
                    <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      카카오 상담하기
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="outline" className="border-brand-green/30 text-brand-green hover:bg-brand-green/5">
                    <Link href="/inquiry" className="inline-flex items-center gap-2">
                      상담 문의하기
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-semibold text-text-dark">회사 기본 정보</h2>
              <div className="mt-4 space-y-3 text-sm text-text-gray">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-green" />
                  대표번호 {CONTACT.phone}
                </p>
                <p className="flex items-center gap-2 break-all">
                  <Mail className="h-4 w-4 text-brand-green" />
                  {CONTACT.email}
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-brand-green" />
                  {CONTACT.website}
                </p>
              </div>
              <div className="mt-5 rounded-xl bg-brand-green/5 p-4">
                <p className="text-xs font-semibold text-brand-green">Core Message</p>
                <p className="mt-1 break-keep text-base font-medium text-text-dark">“{CONTACT.message}”</p>
              </div>
              <p className="mt-4 text-xs text-text-gray">
                {CONTACT.name} ({CONTACT.englishName})
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            label="Company Overview"
            title="교육여행을 넘어, 기관 맞춤형 교육 운영을 함께합니다"
            desc="학교·교육청·지자체·공공기관의 운영 맥락을 이해하고, 교육 효과와 운영 안정성을 동시에 달성할 수 있도록 설계합니다."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "행사 목적과 교육 목표를 먼저 정의한 뒤 프로그램을 구성합니다.",
              "인원·일정·지역·예산 조건에 맞춘 현실적인 운영안을 제시합니다.",
              "현장 운영, 안전 관리, 커뮤니케이션을 단일 파트너로 지원합니다.",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="break-keep text-sm leading-relaxed text-text-dark sm:text-base">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50/70 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            label="CEO"
            title="현장을 아는 리더십으로 교육여행의 기준을 높입니다"
            desc="교육·관광·운영 경험을 바탕으로 고객 기관이 신뢰할 수 있는 실행 중심 시스템을 구축해 왔습니다."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center text-text-gray">
                  <UserRound className="mx-auto h-12 w-12 text-brand-green/60" />
                  <p className="mt-3 text-sm">대표이사 사진 영역</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-text-gray">{ceo.name} | {ceo.title}</p>
              <p className="mt-1 break-keep text-sm font-medium text-text-dark">{ceo.tagline}</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-base font-semibold text-text-dark">학력</h3>
                <ul className="mt-3 space-y-2 text-sm text-text-gray">
                  {ceo.education.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-base font-semibold text-text-dark">주요 이력</h3>
                <ul className="mt-3 space-y-2 text-sm text-text-gray">
                  {ceo.experience.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-base font-semibold text-text-dark">수상</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ceo.awards.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green-primary">
                      <Award className="h-3.5 w-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            label="History"
            title="터치더월드의 발자취"
            desc="1996년 설립 이후 학교·기관 교육 프로그램 운영에 집중하며 전문성을 확장해왔습니다."
          />
          <ol className="relative mt-8 space-y-5 border-l border-brand-green/20 pl-6">
            {history.map((item) => (
              <li key={`${item.year}-${item.detail}`} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-brand-green" />
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                  <p className="text-sm font-semibold text-brand-green">{item.year}</p>
                  <p className="mt-1 break-keep text-sm text-text-dark sm:text-base">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50/70 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            label="Vision & Mission"
            title="학생이 세상과 연결되는 교육"
            desc="여행을 교육의 수단으로 활용해 학생의 성장과 기관의 목표 달성을 함께 지원합니다."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {missions.map((mission) => (
              <div key={mission.title} className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-text-dark">{mission.title}</h3>
                <p className="mt-2 break-keep text-sm leading-relaxed text-text-gray sm:text-base">{mission.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            label="Services"
            title="8대 교육 솔루션"
            desc="학교·기관의 목적과 상황에 맞춰 단독 또는 조합형으로 운영할 수 있습니다."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="inline-flex rounded-lg bg-brand-green/10 p-2">
                    <Icon className="h-5 w-5 text-brand-green" />
                  </div>
                  <p className="mt-3 text-base font-semibold text-text-dark">{service.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50/70 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            label="Strength"
            title="기관이 다시 찾는 이유"
            desc="오랜 운영 경험과 맞춤형 실행력으로 교육 현장에서 반복 신뢰를 만듭니다."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                  <div className="inline-flex rounded-lg bg-brand-green/10 p-2">
                    <Icon className="h-5 w-5 text-brand-green" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-text-dark">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-gray">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <SectionTitle
            label="Trust"
            title="수치와 이력으로 증명하는 신뢰"
            desc="교육 현장에서 검증된 운영 경험을 바탕으로 안정적인 파트너십을 제공합니다."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustStats.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-5 text-center">
                <p className="text-sm text-text-gray">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-text-dark">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <p className="text-sm font-semibold text-text-dark">주요 성과 및 협력 기반</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {achievements.map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green-primary sm:text-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-4 sm:pb-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold text-brand-green">Final CTA</p>
                <h2 className="mt-2 break-keep text-2xl font-semibold text-text-dark sm:text-3xl">
                  학교와 기관의 다음 프로그램,
                  <br className="hidden sm:block" />
                  터치더월드와 함께 준비하세요.
                </h2>
                <p className="mt-3 break-keep text-sm leading-relaxed text-text-gray sm:text-base">
                  인원·지역·일정·목적을 알려주시면 운영 가능한 맞춤 제안으로 빠르게 안내드립니다.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-text-gray">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                    <Phone className="h-4 w-4 text-brand-green" />
                    {CONTACT.phone}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                    <Mail className="h-4 w-4 text-brand-green" />
                    {CONTACT.email}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="bg-brand-green-primary hover:bg-brand-green-primary/90">
                  <Link href="/inquiry" className="inline-flex items-center gap-2">
                    프로그램 문의하기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {kakaoUrl ? (
                  <Button asChild size="lg" variant="outline" className="border-brand-green/30 text-brand-green hover:bg-brand-green/5">
                    <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      카카오 상담하기
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="outline" className="border-brand-green/30 text-brand-green hover:bg-brand-green/5">
                    <Link href="/inquiry" className="inline-flex items-center gap-2">
                      상담 문의하기
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

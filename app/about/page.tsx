import {
  Shield,
  Globe,
  GraduationCap,
  Users,
  Heart,
  Activity,
  Briefcase,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "회사 소개 - Touch The World",
  description: "1996년 설립된 터치더월드는 국내외 교육형 수학여행, 문화 교류 탐방, 테마별 해외연수 등 다양한 교육 및 여행 프로그램을 제공합니다.",
};

const companyInfo = [
  { label: "회사명", value: "주식회사 터치더월드" },
  { label: "사업자등록번호", value: "204-81-51250" },
  { label: "대표이사", value: "박정주" },
  { label: "법인설립", value: "2000년 03월 16일" },
  { label: "업종", value: "종합여행업, 유학 및 교육" },
  { label: "주소", value: "서울특별시 강남구 테헤란로 501 삼성동 브이플렉스" },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "전문 가이드",
    description: "전문인솔자 자격증을 겸비한 다수의 강사가 안내하여\n안전을 보장합니다.",
  },
  {
    icon: Globe,
    title: "다양한 프로그램",
    description: "학생들의 관심과 필요에 맞춘\n다양한 프로그램을 제공합니다.",
  },
  {
    icon: GraduationCap,
    title: "교육적 가치",
    description: "모든 여행은 교육적 가치와\n학습 기회를 제공합니다.",
  },
  {
    icon: Shield,
    title: "안전 관리",
    description: "엄격한 안전 관리와\n비상 대책을 마련하고 있습니다.",
  },
  {
    icon: Users,
    title: "현지 문화 체험",
    description: "학생들이 현지 문화를\n직접 체험할 수 있는 기회를 제공합니다.",
  },
  {
    icon: Heart,
    title: "고객 만족",
    description: "고객의 요구를 충족시키기 위해\n최선을 다하고 있습니다.",
  },
];

const history = [
  { year: 1996, event: "개인회사 Touch the World 창립" },
  { year: 2012, event: "하나투어 전문판매점 계약체결" },
  { year: 2018, event: "하나투어 아웃소싱사 계약체결" },
  { year: 2018, event: "미야자키 국제대학교 동아시아 독점 사무소 개설" },
  { year: 2020, event: "(주) 터치더월드 법인 창업" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-green/5 to-white pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-wide text-text-dark mb-4">
              Learn the <span className="text-brand-green-primary">World</span>
              <br />
              Lead the <span className="text-brand-green-primary">Future</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-text-dark leading-relaxed">
              미래를 위해 항상 노력하는 터치더월드가 되겠습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-dark mb-8 text-center">
              회사 소개
            </h2>
            <div className="prose prose-lg max-w-none text-text-gray leading-relaxed space-y-4 text-center">
              <p>
                국내외 교육형 수학여행, 문화 교류 탐방, 테마별 해외연수, 청소년 전문 프로그램 등 다양한 교육 및 여행 프로그램을 제공합니다.
                <br />
                전국 학교 및 지자체를 대상으로 한 특화된 여행 및 연수 프로그램을 운영하며, 메이저 여행사와의 협력을 통해 B2B 사업을 확대하고 있습니다.
              </p>
              <p>
                또한, 어학연수 및 정규유학 프로그램, 교사 및 공무원 해외연수, 유소년 해외캠프 등을 제공하며,
                <br />
                다양한 캠프 및 방과후 수업 프로그램도 운영하고 있습니다.
              </p>
              <p className="text-center text-xl font-semibold text-text-dark mt-8 pt-8 border-t">
                미래를 열어가는 글로벌 교육 여행,
                <br />
                터치더월드가 함께 하겠습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CEO Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-dark mb-8 text-center">
              대표 소개
            </h2>
            
            {/* CEO Message */}
            <div className="bg-gradient-to-br from-brand-green/5 to-white rounded-2xl p-8 md:p-12 mb-8 border border-brand-green/10">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-text-dark mb-2">
                  박정주 대표이사
                </h3>
                <p className="text-text-gray">
                  1996년부터 현재까지 28년 이상의 교육 여행 및 현장 체험학습 운영 전문가
                </p>
              </div>
              <blockquote className="text-xl md:text-2xl font-serif text-center text-text-dark leading-relaxed italic border-l-4 border-brand-green pl-6 py-4">
                &ldquo;28년, 아이들의 꿈과 함께 현장을 지켜왔습니다.<br />
                안전을 넘어 감동이 있는 교육 여행을 약속드립니다.&rdquo;
              </blockquote>
              <p className="text-center text-text-gray mt-4 font-medium">
                &ldquo;현장이 가장 큰 교실입니다.&rdquo;
              </p>
            </div>

            {/* Career & Expertise */}
            <div className="space-y-8">
              {/* 인적 사항 및 경력 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-brand-green" />
                  인적 사항 및 경력
                </h3>
                <div className="space-y-3 text-text-gray">
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-text-dark min-w-[100px]">성명:</span>
                    <span>박정주 (대표이사)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-text-dark min-w-[100px]">경력:</span>
                    <span>1996년부터 현재까지 <strong className="text-brand-green">28년 이상</strong>의 교육 여행 및 현장 체험학습 운영 전문가</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-text-dark min-w-[100px]">철학:</span>
                    <span className="italic">&ldquo;현장이 가장 큰 교실입니다.&rdquo; (현장 중심의 교육 가치 실현)</span>
                  </div>
                </div>
              </div>

              {/* 전문 역량 및 강점 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-brand-green" />
                  전문 역량 및 강점
                </h3>
                <div className="space-y-4 text-text-gray">
                  <div>
                    <h4 className="font-semibold text-text-dark mb-2">독보적인 노하우</h4>
                    <p>개인회사(1996)부터 현재의 법인(2020)까지 국내외 교육 여행 프로젝트를 직접 진두지휘하며 쌓은 전문성</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-dark mb-2">글로벌 네트워크</h4>
                    <p>하나투어 전문판매점 및 아웃소싱 파트너십, 일본 미야자키 국제대학교 동아시아 독점 사무소 운영 등 글로벌 교육 인프라 보유</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-dark mb-2">맞춤형 설계 능력</h4>
                    <p>단순 관광이 아닌 수학여행, 교사 연수, 특성화고 전공 연수 등 교육 목적에 부합하는 정교한 프로그램 설계 능력</p>
                  </div>
                </div>
              </div>

              {/* 경영 가치 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-brand-green" />
                  경영 가치
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-brand-green/5 rounded-lg">
                    <Shield className="w-10 h-10 text-brand-green mx-auto mb-3" />
                    <h4 className="font-semibold text-text-dark mb-2">안전 (Safety)</h4>
                    <p className="text-sm text-text-gray leading-relaxed">
                      &ldquo;부모의 마음으로&rdquo; 직접 발로 뛰며 사전 답사와 안전 점검을 마친 코스만 제안하는 완벽주의
                    </p>
                  </div>
                  <div className="text-center p-4 bg-brand-green/5 rounded-lg">
                    <Globe className="w-10 h-10 text-brand-green mx-auto mb-3" />
                    <h4 className="font-semibold text-text-dark mb-2">신뢰 (Trust)</h4>
                    <p className="text-sm text-text-gray leading-relaxed">
                      28년간 전국 학교 및 지자체와 쌓아온 두터운 신뢰와 검증된 운영 실적
                    </p>
                  </div>
                  <div className="text-center p-4 bg-brand-green/5 rounded-lg">
                    <GraduationCap className="w-10 h-10 text-brand-green mx-auto mb-3" />
                    <h4 className="font-semibold text-text-dark mb-2">혁신 (Innovation)</h4>
                    <p className="text-sm text-text-gray leading-relaxed">
                      전통적인 여행업을 넘어 AI 상담 시스템 도입 등 미래형 교육 플랫폼으로의 도약 주도
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Expertise */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-text-dark mb-4 text-center">
              터치더월드의 전문성
            </h2>
            <p className="text-center text-text-gray mb-12">
              28년 운영 노하우로 쌓아온 현장 경험과 전문성
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 현장 행사의 생동감 */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-7 h-7 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-dark mb-3">
                      현장 행사의 생동감
                    </h3>
                    <p className="text-text-gray leading-relaxed mb-3">
                      현장이 곧 교실입니다. 아이들의 눈높이에 맞춘 체험 위주의 프로그램으로 학습 동기를 부여하고 잊지 못할 추억을 선사합니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #자기주도형체험
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #창의적체험활동
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #즐거운배움
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 전문 인솔 및 운영 역량 */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-dark mb-3">
                      전문 인솔 및 운영 역량
                    </h3>
                    <p className="text-text-gray leading-relaxed mb-3">
                      28년 운영 노하우의 핵심은 &lsquo;안전&rsquo;입니다. 사전 답사부터 현장 밀착 케어까지, 전문 인솔 인력이 모든 행사를 체계적으로 관리합니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #안전제일
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #체계적인운영
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #전문인솔자배치
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 특성화고 및 전공 심화 프로그램 */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-7 h-7 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-dark mb-3">
                      특성화고 및 전공 심화 프로그램
                    </h3>
                    <p className="text-text-gray leading-relaxed mb-3">
                      특성화고교의 특성에 맞춘 전공 심화 체험 프로그램을 제공합니다. 산업 현장 견학과 실습 위주의 구성으로 학생들의 진로 설계를 돕습니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #진로탐색
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #특성화고맞춤형
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #직업교육연계
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 역사 및 문화 탐방의 전문성 */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-dark mb-3">
                      역사 및 문화 탐방의 전문성
                    </h3>
                    <p className="text-text-gray leading-relaxed mb-3">
                      단순한 관람을 넘어 역사의 숨결을 느낍니다. 전문 해설사가 들려주는 흥미진진한 스토리텔링으로 인문학적 소양을 기르는 품격 있는 탐방을 지향합니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #역사문화탐방
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #스토리텔링해설
                      </span>
                      <span className="text-xs px-3 py-1 bg-brand-green/10 text-brand-green rounded-full">
                        #인문학적소양
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-dark mb-8 text-center">
              기업소개
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companyInfo.map((info) => (
                  <div key={info.label} className="flex flex-col">
                    <dt className="text-sm font-semibold text-text-gray mb-2">
                      {info.label}
                    </dt>
                    <dd className="text-base text-text-dark font-medium">
                      {info.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-text-dark mb-4 text-center">
              Why Choose Us
            </h2>
            <p className="text-center text-text-gray mb-12">
              안전한 여행 환경 제공
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyChooseUs.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg bg-white transform transition-all hover:-translate-y-1 hover:scale-105 hover:border-brand-green hover:shadow-xl hover:bg-brand-green/5 group"
                  >
                    <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-green transition-colors">
                      <Icon className="w-8 h-8 text-brand-green group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-center font-semibold text-text-dark mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-gray text-center leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-dark mb-12 text-center">
              회사연혁
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brand-green/20"></div>
              
              <div className="space-y-8">
                {history.map((item, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    {/* Year circle */}
                    <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-brand-green rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {item.year}
                      </span>
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 pt-2">
                      <p className="text-base md:text-lg text-text-dark font-medium">
                        {item.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


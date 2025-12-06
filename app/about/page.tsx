import {
  Shield,
  Globe,
  GraduationCap,
  Users,
  Heart,
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
      <section className="bg-gradient-to-b from-brand-green/5 to-white py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-wide text-text-dark mb-4">
              Learn the World
              <br />
              Lead the Future
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


import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { BRAND_KEYWORDS, B2B_KEYWORDS, mergeKeywords } from "@/lib/seo";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "자주 묻는 질문(FAQ) | 터치더월드",
  description:
    "교육여행·수학여행·교사연수 프로그램에 대해 학교 담당자들이 자주 묻는 질문과 답변을 모았습니다.",
  keywords: mergeKeywords(BRAND_KEYWORDS, B2B_KEYWORDS, [
    "교육여행 FAQ",
    "수학여행 비용",
    "교사연수 신청",
    "학교 여행 최소 인원",
    "나라장터 교육여행",
  ]),
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    question: "프로그램 견적은 어떻게 받을 수 있나요?",
    answer:
      "홈페이지 '문의하기' 페이지에서 빠른 문의(이름·연락처)나 구체적인 문의(일정·인원·예산)를 남겨주시면 담당자가 1영업일 내 맞춤 견적을 보내드립니다. 카카오톡 채널(터치더월드)로도 접수 가능합니다.",
  },
  {
    question: "최소 참가 인원이 어떻게 되나요?",
    answer:
      "학교 단체 기준 20명 이상부터 상담이 가능합니다. 소규모 교직원 연수의 경우 인원에 관계없이 별도 문의해 주시면 최선을 다해 협의드리겠습니다.",
  },
  {
    question: "나라장터(조달청)를 통한 계약이 가능한가요?",
    answer:
      "네, 터치더월드는 나라장터 등록 업체입니다. 공공기관·학교의 조달 구매 절차에 따른 계약이 가능하며, 관련 서류 준비를 도와드립니다.",
  },
  {
    question: "여행 중 안전 관리는 어떻게 이루어지나요?",
    answer:
      "모든 프로그램에 전담 인솔자가 배치되며, 출발 전 사전 답사를 통해 안전 동선을 검토합니다. 전원 여행자 보험에 가입하고, 비상 연락망 및 위기 대응 매뉴얼을 운영합니다.",
  },
  {
    question: "프로그램은 학교 교육과정과 연계가 가능한가요?",
    answer:
      "가능합니다. 사회·과학·역사·진로 등 교과목과 연계한 탐구 활동 중심으로 프로그램을 설계합니다. 학교 측 교육계획서를 공유해 주시면 더욱 맞춤화된 커리큘럼을 제안드립니다.",
  },
  {
    question: "해외 프로그램 진행이 가능한 지역은 어디인가요?",
    answer:
      "일본(히로시마·오사카·동경), 중국(청도), 싱가포르, 동남아시아 주요 지역에서 프로그램을 운영하고 있습니다. 특성화고 해외 취업 연계 과정도 별도로 운영합니다.",
  },
  {
    question: "예산이 정해지지 않은 상태에서도 문의할 수 있나요?",
    answer:
      "물론입니다. 인원·일정·목적지만 알려주셔도 예산 범위에 맞는 옵션을 여러 가지 제안드립니다. 예산 협의 후 확정하는 방식으로 진행합니다.",
  },
  {
    question: "수학여행과 교육여행의 차이가 무엇인가요?",
    answer:
      "수학여행은 학교 행사의 일환으로 학생들이 단체로 떠나는 여행이며, 교육여행은 체험·탐구·현장학습 등 교육 목적이 보다 명확하게 설계된 여행입니다. 터치더월드는 두 형태 모두 기획·운영합니다.",
  },
  {
    question: "교사·교직원 연수도 지원하나요?",
    answer:
      "네, 교장·부장·일반 교사 대상 국내외 교육 연수 프로그램을 별도로 운영합니다. 연수 목적과 참가 인원에 따라 국내(인천·제주 등) 또는 해외(일본·싱가포르 등) 코스를 제안드립니다.",
  },
  {
    question: "계약 후 일정 변경이나 취소가 가능한가요?",
    answer:
      "계약 조건에 따라 일정 변경 및 취소가 가능합니다. 취소 수수료는 출발일 기준 잔여 일수에 따라 달라지며, 계약 시 상세 규정을 안내드립니다. 학교 사정에 따른 변경은 최대한 유연하게 협의합니다.",
  },
];

export default function FaqPage() {
  const siteUrl = getSiteUrl();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "자주 묻는 질문", item: `${siteUrl}/faq` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark mb-2">자주 묻는 질문</h1>
        <p className="text-text-gray mb-10">
          교육여행·수학여행·교사연수 프로그램에 대해 자주 묻는 질문을 모았습니다.
          더 궁금한 사항은 문의하기를 통해 직접 상담받으세요.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6"
            >
              <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3 flex gap-2">
                <span className="text-brand-green-primary shrink-0">Q.</span>
                {faq.question}
              </h2>
              <p className="text-sm sm:text-base text-text-gray leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-brand-green-primary px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">더 궁금한 점이 있으신가요?</p>
            <p className="text-white/80 text-sm mt-0.5">담당자가 직접 상담해드립니다.</p>
          </div>
          <Link
            href="/inquiry?type=quick"
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white text-brand-green-primary font-semibold px-5 py-2.5 text-sm hover:bg-white/90 active:scale-[0.97] transition-all"
          >
            빠른 문의하기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

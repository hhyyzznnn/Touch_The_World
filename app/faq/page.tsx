import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { BRAND_KEYWORDS, B2B_KEYWORDS, mergeKeywords } from "@/lib/seo";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FAQS } from "@/lib/faq-data";

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

const faqs = FAQS;

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
            rel="nofollow" href="/inquiry?type=quick"
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

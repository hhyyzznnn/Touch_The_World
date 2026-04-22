import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HelpCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";
import { SeoLandingPageData } from "@/lib/seo-landing-pages";

interface SeoLandingPageProps {
  page: SeoLandingPageData;
}

export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${page.path}`;
  const imageUrl = `${siteUrl}${page.image}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.metaTitle,
    description: page.description,
    provider: {
      "@type": "TravelAgency",
      name: COMPANY_INFO.name,
      url: siteUrl,
      telephone: COMPANY_INFO.phone,
      email: COMPANY_INFO.email,
    },
    areaServed: "KR",
    serviceType: page.title,
    url: pageUrl,
    image: imageUrl,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "프로그램",
        item: `${siteUrl}/programs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.title,
        item: pageUrl,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="border-b border-gray-100 bg-gradient-to-b from-brand-green/5 to-white py-12 sm:py-16">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-green">{page.eyebrow}</p>
            <h1 className="mt-4 break-keep text-3xl font-semibold leading-tight text-text-dark sm:text-5xl">
              {page.title}
              <span className="block text-brand-green-primary">맞춤 기획·운영</span>
            </h1>
            <p className="mt-5 max-w-2xl break-keep text-base leading-relaxed text-text-gray sm:text-lg">
              {page.lead}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-brand-green-primary hover:bg-brand-green-primary/90">
                <Link href="/inquiry" className="inline-flex items-center gap-2">
                  견적 문의하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-brand-green/30 text-brand-green hover:bg-brand-green/5">
                <a href={`tel:${COMPANY_INFO.phone}`} className="inline-flex items-center gap-2">
                  전화 상담
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm">
            <div className="relative aspect-[4/5]">
              <Image
                src={page.image}
                alt={`${page.title} 대표 카드뉴스`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover scale-[1.035]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 py-8">
        <div className="container mx-auto grid gap-3 px-4 sm:grid-cols-3">
          {page.stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-text-gray">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-text-dark">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-2xl font-semibold text-text-dark sm:text-3xl">
              검색보다 중요한 건 실제 운영 품질입니다
            </h2>
            <p className="mt-3 break-keep text-sm leading-relaxed text-text-gray sm:text-base">
              터치더월드는 학교 담당자가 바로 검토할 수 있도록 교육 목표, 안전 관리, 예산과 일정 조율 기준을 구체적으로 제안합니다.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {page.sections.map((section) => (
              <article key={section.title} className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="break-keep text-xl font-semibold text-text-dark">{section.title}</h3>
                <p className="mt-3 break-keep text-sm leading-relaxed text-text-gray">{section.body}</p>
                <ul className="mt-5 space-y-2">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-text-dark">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" />
                      <span className="break-keep">{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold text-brand-green">Process</p>
            <h2 className="mt-2 text-2xl font-semibold text-text-dark">상담부터 운영까지</h2>
            <p className="mt-3 break-keep text-sm leading-relaxed text-text-gray">
              학교의 요청을 듣고, 실행 가능한 일정과 견적으로 바꾸는 과정을 단계별로 진행합니다.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-5">
            {page.process.map((step, index) => (
              <li key={step} className="rounded-lg border border-gray-200 bg-white p-4">
                <span className="text-xs font-semibold text-brand-green">STEP {index + 1}</span>
                <p className="mt-2 break-keep text-sm font-medium text-text-dark">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-text-dark">자주 묻는 질문</h2>
            <div className="mt-5 space-y-3">
              {page.faqs.map((faq) => (
                <article key={faq.question} className="rounded-lg border border-gray-200 bg-white p-5">
                  <h3 className="flex gap-2 break-keep text-base font-semibold text-text-dark">
                    <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" />
                    {faq.question}
                  </h3>
                  <p className="mt-3 break-keep text-sm leading-relaxed text-text-gray">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="rounded-lg border border-brand-green/20 bg-brand-green/5 p-6">
            <h2 className="break-keep text-xl font-semibold text-text-dark">관련 콘텐츠</h2>
            <div className="mt-5 space-y-3">
              {page.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-text-dark transition-colors hover:border-brand-green/40 hover:text-brand-green"
                >
                  <span className="break-keep">{link.label}</span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </Link>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-white p-4 text-sm text-text-gray">
              <p className="font-medium text-text-dark">{COMPANY_INFO.phone}</p>
              <p className="mt-1">{COMPANY_INFO.email}</p>
              <p className="mt-3 break-keep">학교명, 예상 인원, 희망 일정만 알려주셔도 1차 방향을 잡아드립니다.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

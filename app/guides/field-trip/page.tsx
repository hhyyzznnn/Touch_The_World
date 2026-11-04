import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { BRAND_KEYWORDS, mergeKeywords } from "@/lib/seo";

/**
 * 현장체험학습 준비 기준 정리 — 교사들이 "현장체험학습 운영 지침", "수학여행 안전요원 기준" 등으로 찾는 내용을
 * 교육청 매뉴얼·법령·보도 등 공개 자료를 출처로 달아 정리한 안내 페이지 (2026-11 작성).
 * 기준이 바뀌면 아래 UPDATED_AT과 본문, SOURCES를 함께 고친다. 입찰 공고 경향 수치는 나라장터 입찰 알림이
 * 모은 학교 공고(G2BNotice.aiSummary)에서 집계한 값이다.
 */
const UPDATED_AT = "2026년 11월";

export const metadata: Metadata = {
  title: "현장체험학습·수학여행 준비 기준 정리 (안전요원·계약·버스) | 터치더월드",
  description:
    "수학여행·수련활동 등 현장체험학습을 준비할 때 확인할 안전요원 배치 기준, 업체 계약 방법, 전세버스 이용, 교원 면책 규정을 교육청 매뉴얼과 법령 출처와 함께 정리했습니다.",
  keywords: mergeKeywords(BRAND_KEYWORDS, [
    "현장체험학습 운영 지침",
    "수학여행 안전요원 기준",
    "현장체험학습 매뉴얼",
    "수학여행 계약 방법",
    "현장체험학습 전세버스",
    "체험학습 교사 면책",
  ]),
  alternates: { canonical: "/guides/field-trip" },
};

const SOURCES = {
  incheonManual: { label: "인천광역시교육청, 안전한 현장체험학습 운영 매뉴얼(2021)", url: "https://www.ice.go.kr/upload/board/3136/2021/02/1613348077269.pdf" },
  chungbukManual: { label: "충청북도교육청, 2026 현장체험학습 운영 매뉴얼", url: "http://mhc.cbe.go.kr/upload/hp-use/na/bbs_1327/2026/02/6BC12A21-9946-0F65-7730-87DEF2AF29B5.pdf" },
  gyeonggiGuide: { label: "경기도교육청, 현장체험학습 유형별 운영 안내", url: "https://www.goe.go.kr/resource/old/BBSMSTR_000000030137/BBS_202308280846004301.pdf" },
  contractLaw: { label: "국가법령정보센터, 지방계약법 시행령 제30조(견적에 의한 계약)", url: "https://www.law.go.kr/LSW//lsLawLinkInfo.do?lsJoLnkSeq=900053374&chrClsCd=010202" },
  busLaw: { label: "교육플러스, 전세버스 현장체험학습 이용 적법 — 관계부처 합의(2023)", url: "https://www.edpl.co.kr/news/articleView.html?idxno=10314" },
  busLawPassed: { label: "포커스인천, 현장체험학습 전세버스 이용 도로교통법 개정안 통과(2023)", url: "http://www.focusincheon.com/news/articleView.html?idxno=3873" },
  immunity: { label: "에듀프레스, 현장체험학습 '중과실 아니면 면책' 추진(2026.5)", url: "https://www.edupress.kr/news/articleView.html?idxno=30261" },
  immunityNews: { label: "경향신문, 체험학습 사고 중과실 아니면 교사 면책(2026.5)", url: "https://www.khan.co.kr/article/202605282145015/" },
} as const;

type SourceKey = keyof typeof SOURCES;

function Src({ ids }: { ids: SourceKey[] }) {
  return (
    <p className="mt-2 text-xs text-text-gray">
      출처:{" "}
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && " · "}
          <a href={SOURCES[id].url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-text-dark">
            {SOURCES[id].label}
          </a>
        </span>
      ))}
    </p>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="text-lg sm:text-xl font-bold text-text-dark break-keep">{title}</h2>
      <div className="mt-3 space-y-3 text-sm sm:text-base leading-relaxed text-text-dark break-keep">{children}</div>
    </section>
  );
}

const TOC = [
  { id: "safety", label: "안전요원·인솔 기준" },
  { id: "contract", label: "업체 계약 방법" },
  { id: "bids", label: "최근 학교 입찰 공고 경향" },
  { id: "bus", label: "전세버스 이용" },
  { id: "immunity", label: "교원 면책 규정" },
  { id: "checklist", label: "준비 순서" },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "현장체험학습·수학여행 준비 기준 정리",
  description: "안전요원 배치, 업체 계약, 전세버스, 교원 면책 규정을 공개 자료 출처와 함께 정리",
  author: { "@type": "Organization", name: "터치더월드" },
  publisher: { "@type": "Organization", name: "터치더월드" },
  inLanguage: "ko-KR",
};

export default function FieldTripGuidePage() {
  return (
    <div className="bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-6">
        <header>
          <p className="text-sm font-semibold text-brand-green-primary">선생님 업무 안내</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-text-dark break-keep text-balance">
            현장체험학습·수학여행 준비 기준 정리
          </h1>
          <p className="mt-3 text-sm sm:text-base text-text-gray leading-relaxed break-keep">
            수학여행·수련활동을 준비하실 때 자주 확인하시는 기준을 교육청 매뉴얼과 법령, 보도 자료를 출처로 모았습니다.
            기준은 교육청과 학년도마다 조금씩 다르니, 최종 판단은 소속 교육청의 올해 매뉴얼을 따라 주세요.
          </p>
          <p className="mt-2 text-xs text-text-gray">정리 기준: {UPDATED_AT}</p>
          <nav className="mt-5 flex flex-wrap gap-2" aria-label="목차">
            {TOC.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-text-dark hover:border-brand-green-primary">
                {t.label}
              </a>
            ))}
          </nav>
        </header>

        <Section id="safety" title="1. 안전요원·인솔 기준">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <b>안전요원</b>: 일정 규모 이상의 수학여행은 <b>학생 50명당 1명 이상</b> 안전교육을 이수한 안전요원을 둡니다.
              적용 규모는 자료마다 다릅니다. 인천교육청 매뉴얼(2021)은 학생 150명 이상 대규모 수학여행 기준으로, 충북교육청 2026 매뉴얼은 학생 100명 이상 기준으로 적고 있습니다.
            </li>
            <li>
              <b>대규모 수학여행(학생 150명 이상)</b>: 학생·학부모 동의 절차, 안전요원 확보, 안전 대책과 교육적 효과에 대해 교육청 등의 점검·컨설팅을 거친 뒤 실시합니다.
            </li>
            <li>
              <b>안전요원 배치가 어려운 소규모·1일형</b>: 학교장 책임 아래 안전 대책을 세우고 학교운영위원회 심의를 거쳐 세부 계획에 반영합니다.
            </li>
            <li>
              <b>인솔자가 1명</b>이면 반드시 교원이어야 합니다.
            </li>
          </ul>
          <Src ids={["incheonManual", "chungbukManual", "gyeonggiGuide"]} />
        </Section>

        <Section id="contract" title="2. 업체 계약 방법">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <b>수의계약은 원칙적으로 2인 이상 견적</b>을 받습니다(지방계약법 시행령 제30조).
            </li>
            <li>
              <b>추정가격 2천만 원 이하 용역</b>은 1인 견적으로 계약할 수 있습니다. 추정가격은 부가가치세를 뺀 금액입니다.
            </li>
            <li>
              <b>여성기업·장애인기업 등</b>과 계약할 때는 <b>추정가격 5천만 원 이하</b>까지 1인 견적이 가능합니다.
            </li>
            <li>그보다 큰 수학여행·수련활동은 대부분 나라장터 입찰로 업체를 정합니다. 학교·교육청 자체 지침이 법령보다 엄격할 수 있으니 행정실 기준도 함께 확인해 주세요.</li>
          </ul>
          <Src ids={["contractLaw"]} />
          <div className="rounded-xl bg-brand-green-primary/5 p-4 text-sm">
            터치더월드는 나라장터·학교장터 등록 업체이며 소상공인·여성기업으로 등록되어 있어, 추정가격 5천만 원 이하는 1인 견적 수의계약으로 진행하실 수 있습니다.
          </div>
        </Section>

        <Section id="bids" title="3. 최근 학교 입찰 공고 경향">
          <p>
            2026년 10월 말~11월 초 나라장터에 올라온 초·중·고 교육여행 입찰 공고 39건의 첨부 공고문을 정리한 결과입니다.
            입찰을 준비하시는 학교에서 공고문을 만드실 때 참고하실 수 있습니다.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-text-gray">
                  <th className="py-2 pr-3 font-medium">항목</th>
                  <th className="py-2 font-medium">경향</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="py-2 pr-3 font-medium whitespace-nowrap">입찰 방식</td><td className="py-2">39건 중 37건이 2단계 입찰(규격·가격)</td></tr>
                <tr><td className="py-2 pr-3 font-medium whitespace-nowrap">평가 방식</td><td className="py-2">제안서 평가 통과 업체 중 최저가 낙찰. 통과 점수는 80점(29건)이 가장 많고 85점(6건)이 뒤를 이음</td></tr>
                <tr><td className="py-2 pr-3 font-medium whitespace-nowrap">참가 지역 제한</td><td className="py-2">39건 중 37건이 본점 소재지로 지역 제한</td></tr>
                <tr><td className="py-2 pr-3 font-medium whitespace-nowrap">자주 넣는 조건</td><td className="py-2">안전요원 배치(32건), 여행자보험 보상 한도(29건), 숙소 등급(15건)</td></tr>
                <tr><td className="py-2 pr-3 font-medium whitespace-nowrap">국내 1인당 기초금액</td><td className="py-2">중간값 약 67만 원 (2박 3일 내외, 학생·교원 합산 인원 기준)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-gray">집계: 터치더월드가 나라장터 공개 공고와 첨부 공고문을 모아 정리 (2026.10.24~11.05 수집분)</p>
        </Section>

        <Section id="bus" title="4. 전세버스 이용">
          <p>
            2023년 ‘노란버스’ 논란 이후 도로교통법이 개정되어, 현장체험학습처럼 <b>비상시적으로 이루어지는 교육활동을 위한 이동</b>은 어린이통학버스 이용 범위에서 빠졌습니다.
            현장체험학습에는 일반 전세버스를 이용하실 수 있습니다.
          </p>
          <Src ids={["busLaw", "busLawPassed"]} />
        </Section>

        <Section id="immunity" title="5. 교원 면책 규정">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <b>현행</b>: 학교안전법 제10조 제5항은 안전사고관리 지침에 따라 <b>학생에 대한 안전조치 의무를 다한 경우</b> 학교 안전사고에 대해 민·형사상 책임을 지지 않는다고 정하고 있습니다.
            </li>
            <li>
              <b>개정 추진</b>: 교육부는 2026년 5월, <b>고의 또는 중과실이 없으면</b> 책임을 지지 않도록 바꾸고 적용 범위를 교육활동 전반으로 넓히는 개정을 추진한다고 발표했습니다.
              국회 통과와 시행 시기는 국가법령정보센터에서 최신 내용을 확인해 주세요.
            </li>
          </ul>
          <Src ids={["immunity", "immunityNews"]} />
        </Section>

        <Section id="checklist" title="6. 준비 순서 한눈에 보기">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>학생·학부모 수요 조사, 규모와 유형(학년 단위·소규모 테마형) 결정</li>
            <li>운영 계획서 작성, 학교운영위원회 심의</li>
            <li>업체 선정 — 금액에 따라 견적 비교(수의계약) 또는 나라장터 입찰</li>
            <li>사전답사 — 숙소·차량·체험시설 안전 점검</li>
            <li>가정통신문·참가 동의서, 학생 안전교육, 비상연락망·여행자보험 확인</li>
            <li>실시 후 결과·정산 보고, 만족도 조사</li>
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/membership?from=guide#join" className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-brand-green-primary">
              <span>
                <span className="block font-semibold">서류·안전 양식집</span>
                <span className="block text-sm text-text-gray">가정통신문·계획서·사전답사 보고서·안전 점검표 등</span>
              </span>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-text-gray group-hover:text-brand-green-primary" />
            </Link>
            <Link href="/inquiry" className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-brand-green-primary">
              <span>
                <span className="block font-semibold">일정·견적 상담</span>
                <span className="block text-sm text-text-gray">학년·인원·지역만 알려주시면 맞춤 일정을 보내드려요</span>
              </span>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-text-gray group-hover:text-brand-green-primary" />
            </Link>
          </div>
        </Section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <h2 className="text-base font-bold text-text-dark">출처 모음</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {Object.values(SOURCES).map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-text-dark underline underline-offset-2 hover:text-brand-green-primary">
                  {s.label}
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-text-gray">
            이 페이지는 공개 자료를 정리한 참고용 안내이며 법적 해석이 아닙니다. 실제 운영은 소속 교육청의 올해 지침과 학교 규정을 따라 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}

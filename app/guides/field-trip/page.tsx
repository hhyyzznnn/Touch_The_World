import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { BRAND_KEYWORDS, mergeKeywords } from "@/lib/seo";

/**
 * 현장체험학습 준비 기준 정리 — 교사들이 "현장체험학습 운영 지침", "수학여행 안전요원 기준" 등으로 찾는 내용을
 * 교육청 매뉴얼·법령·정부 발표·보도 등 공개 자료를 출처로 달아 정리한 안내 페이지.
 * 2026-11-09 원문 대조 검토: 매뉴얼 PDF(인천 2021·경기 2023·충북 2026)의 안전요원·인솔·계약 기준, 교육부 2026.5.28 발표,
 * 학교안전법 제10조 제5항(2025.12.2 개정), 지자체 지원 제도. 기준이 바뀌면 UPDATED_AT·본문·SOURCES를 함께 고친다.
 * 입찰 공고 경향 수치는 나라장터 입찰 알림이 모은 학교 공고(G2BNotice.aiSummary)에서 집계한 값이다.
 */
const UPDATED_AT = "2026년 11월 9일";

export const metadata: Metadata = {
  title: "현장체험학습·수학여행 준비 기준 정리 (안전요원·지역별 지원·계약·버스) | 터치더월드",
  description:
    "수학여행·수련활동 등 현장체험학습을 준비할 때 확인할 지역별 안전요원 배치 기준, 교육청·지자체 지원 제도, 업체 계약 방법, 전세버스 이용, 교원 면책 규정을 교육청 매뉴얼과 법령 출처와 함께 정리했습니다.",
  keywords: mergeKeywords(BRAND_KEYWORDS, [
    "현장체험학습 운영 지침",
    "수학여행 안전요원 기준",
    "현장체험학습 매뉴얼",
    "수학여행 지원사업",
    "교육여행 지자체 지원",
    "수학여행 계약 방법",
    "현장체험학습 전세버스",
    "체험학습 교사 면책",
  ]),
  alternates: { canonical: "/guides/field-trip" },
};

const SOURCES = {
  incheonManual: { label: "인천광역시교육청, 안전한 현장체험학습 운영 매뉴얼(2021)", url: "https://www.ice.go.kr/upload/board/3136/2021/02/1613348077269.pdf" },
  gyeonggiGuide: { label: "경기도교육청, 현장체험학습 유형별 운영 안내(2023.2)", url: "https://www.goe.go.kr/resource/old/BBSMSTR_000000030137/BBS_202308280846004301.pdf" },
  chungbukManual: { label: "충청북도교육청, 2026 현장체험학습 운영 매뉴얼", url: "http://mhc.cbe.go.kr/upload/hp-use/na/bbs_1327/2026/02/6BC12A21-9946-0F65-7730-87DEF2AF29B5.pdf" },
  moeBriefing: { label: "교육부, 현장체험학습 지원 방안 브리핑(2026.5.28)", url: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156764072" },
  moeNews: { label: "한국경제, 수학여행 사고에서 교사 책임 면제…교육부, 현장체험학습 개편(2026.5.28)", url: "https://www.hankyung.com/article/2026052843697" },
  incheonSupport: { label: "인천타임스, 인천관광공사 국내 교육여행 성지 굳히기 나선다(2026.3.18)", url: "https://incheontimes.co.kr/news/view.php?bIdx=36331" },
  gapyeongIncentive: { label: "가평군 공고 제2026-338호, 2026년 국내·외 단체관광객 유치 인센티브 지원계획", url: "http://www.bta.or.kr/resources/upload/incentive/2026%EB%85%84%20%EA%B2%BD%EA%B8%B0%20%EA%B0%80%ED%8F%89%EA%B5%B0%20%EA%B5%AD%EB%82%B4%EC%99%B8%20%EB%8B%A8%EC%B2%B4%EA%B4%80%EA%B4%91%EA%B0%9D%20%EC%9C%A0%EC%B9%98%20%EC%9D%B8%EC%84%BC%ED%8B%B0%EB%B8%8C%20%EC%A7%80%EC%9B%90%EC%82%AC%EC%97%85%20%EC%9A%B4%EC%98%81%20%EA%B3%B5%EA%B3%A0.pdf" },
  goesanIncentive: { label: "기업마당, 2026년 괴산군 단체관광객 유치 여행사 인센티브 지원계획 공고", url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000117575" },
  youthTrip: { label: "교육언론[창], 학교 대상 '2026 청소년 교육여행' 지원(2026.2.18)", url: "https://www.educhang.co.kr/news/articleView.html?idxno=8426" },
  contractLaw: { label: "국가법령정보센터, 지방계약법 시행령 제30조(견적에 의한 계약)", url: "https://www.law.go.kr/LSW//lsLawLinkInfo.do?lsJoLnkSeq=900053374&chrClsCd=010202" },
  busLaw: { label: "교육플러스, 전세버스 현장체험학습 이용 적법 — 관계부처 합의(2023)", url: "https://www.edpl.co.kr/news/articleView.html?idxno=10314" },
  busLawPassed: { label: "포커스인천, 현장체험학습 전세버스 이용 도로교통법 개정안 통과(2023.10)", url: "http://www.focusincheon.com/news/articleView.html?idxno=3873" },
  schoolSafetyLaw: { label: "국가법령정보센터, 학교안전사고 예방 및 보상에 관한 법률 개정 이력", url: "https://law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=010380&lsRvsGubun=all" },
} as const;

type SourceKey = keyof typeof SOURCES;

function Src({ ids }: { ids: SourceKey[] }) {
  return (
    <p className="text-xs leading-relaxed text-text-gray">
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

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="text-xl md:text-2xl font-bold text-text-dark break-keep">{title}</h2>
      {lead && <p className="mt-2 text-base leading-[1.7] text-text-gray break-keep">{lead}</p>}
      <div className="mt-4 space-y-4 text-base leading-[1.7] text-text-dark break-keep">{children}</div>
    </section>
  );
}

/** 안내·주의 상자 */
function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-green-primary/20 bg-brand-green-primary/5 p-4 sm:p-5">
      <p className="font-bold text-brand-green-primary">{title}</p>
      <div className="mt-1.5 text-sm sm:text-base leading-[1.7] text-text-dark">{children}</div>
    </div>
  );
}

/** 표 — 모바일에서는 가로로 넘겨 봄 */
function Table({ head, rows, minWidth = 560 }: { head: string[]; rows: React.ReactNode[][]; minWidth?: number }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead>
          <tr className="bg-gray-50">
            {head.map((h) => (
              <th key={h} scope="col" className="border-b border-gray-200 px-3 py-2.5 text-left font-bold text-text-dark">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 align-top">
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="whitespace-nowrap px-3 py-3 text-left font-bold text-text-dark">
                    {cell}
                  </th>
                ) : (
                  <td key={j} className="px-3 py-3 leading-relaxed text-text-dark">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegionCard({ region, children }: { region: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
      <p className="text-lg font-bold text-text-dark">{region}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function SupportItem({ who, title, children }: { who: "교육청" | "지자체" | "정부"; title: string; children: React.ReactNode }) {
  const tone = who === "지자체" ? "bg-[#1B4332] text-white" : "bg-gray-100 text-text-dark";
  return (
    <div>
      <p className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${tone}`}>{who}</span>
        <span className="font-bold">{title}</span>
      </p>
      <div className="mt-1 text-sm sm:text-base leading-[1.7] text-text-dark">{children}</div>
    </div>
  );
}

/** 지역별 안전요원·인솔 기준 — 매뉴얼 원문 대조(2026-11-09). PC는 표, 모바일은 지역별 카드로 */
const SAFETY_ITEMS = ["규모 구분", "수학여행 안전요원", "인솔자", "교육청 점검"] as const;
const SAFETY_BY_REGION: { region: string; source: string; values: React.ReactNode[] }[] = [
  {
    region: "인천",
    source: "2021 매뉴얼",
    values: [
      "소규모 100명 미만 / 중규모 100~149명 / 대규모 150명 이상",
      <>소규모 배치 권장, 중규모 1명 이상, <b>대규모 학생 50명당 1명</b> 의무</>,
      "학급당 2명 배치 권장 (교감·교사·행정요원·학부모 등)",
      "대규모는 교육청 점검·컨설팅 후 실시",
    ],
  },
  {
    region: "경기",
    source: "2023 안내",
    values: [
      "소규모: 3학급 이하 또는 100명 미만 / 대규모: 4학급 이상이면서 100명 이상",
      <><b>규모와 관계없이 학생 50명당 1명 이상</b> 의무 (안전요원 연수를 이수한 교사가 겸할 수 있음)</>,
      "학급당 2명. 학교운영위원회 심의를 거치면 학급당 1명 가능 (이때 인솔자는 교사만)",
      "대규모 수학여행·국외는 교육지원청에 세부계획 제출, 컨설팅 대상",
    ],
  },
  {
    region: "충북",
    source: "2026 매뉴얼",
    values: [
      "소규모 100명 미만 / 중규모 100~149명 / 대규모 150명 이상",
      <>소·중규모 1명 이상, <b>대규모 학생 50명당 1명</b> 의무</>,
      "학급(버스)당 2명 이상 원칙. 안전이 확보되면 운영위원회 심의를 거쳐 교사 1명이 인솔",
      "대규모 수학여행·국외는 대면 컨설팅 의무",
    ],
  },
];

function RegionCompare() {
  return (
    <>
      <div className="hidden md:block">
        <Table
          head={["항목", ...SAFETY_BY_REGION.map((r) => `${r.region} (${r.source})`)]}
          minWidth={640}
          rows={SAFETY_ITEMS.map((item, i) => [item, ...SAFETY_BY_REGION.map((r) => r.values[i])])}
        />
      </div>
      <div className="space-y-3 md:hidden">
        {SAFETY_BY_REGION.map((r) => (
          <div key={r.region} className="rounded-xl border border-gray-200 p-4">
            <p className="text-lg font-bold">
              {r.region} <span className="text-sm font-normal text-text-gray">{r.source}</span>
            </p>
            <dl className="mt-2 divide-y divide-gray-100">
              {SAFETY_ITEMS.map((item, i) => (
                <div key={item} className="py-2.5">
                  <dt className="text-sm font-bold text-text-gray">{item}</dt>
                  <dd className="mt-0.5 leading-[1.7]">{r.values[i]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

const TOC = [
  { id: "summary", label: "한눈에 보기" },
  { id: "safety", label: "지역별 안전요원·인솔 기준" },
  { id: "support", label: "교육청·지자체 지원" },
  { id: "contract", label: "업체 계약 방법" },
  { id: "bids", label: "최근 입찰 공고 경향" },
  { id: "bus", label: "전세버스 이용" },
  { id: "immunity", label: "교원 면책 규정" },
  { id: "checklist", label: "준비 순서" },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "현장체험학습·수학여행 준비 기준 정리",
  description: "지역별 안전요원 배치 기준, 교육청·지자체 지원 제도, 업체 계약, 전세버스, 교원 면책 규정을 공개 자료 출처와 함께 정리",
  dateModified: "2026-11-09",
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
          <h1 className="mt-1 text-2xl md:text-4xl font-bold text-text-dark break-keep text-balance">
            현장체험학습·수학여행 준비 기준 정리
          </h1>
          <p className="mt-3 text-base leading-[1.7] text-text-gray break-keep">
            수학여행·수련활동을 준비하실 때 자주 확인하시는 기준과 지원 제도를 교육청 매뉴얼, 법령, 정부 발표를 출처로 모았습니다.
            기준은 교육청과 학년도마다 다르니, 최종 판단은 소속 교육청의 올해 매뉴얼과 공문을 따라 주세요.
          </p>
          <p className="mt-2 text-sm text-text-gray">정리 기준: {UPDATED_AT}</p>
          <nav className="mt-5 flex flex-wrap gap-2" aria-label="목차">
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-gray-200 bg-white px-4 text-sm text-text-dark hover:border-brand-green-primary"
              >
                {t.label}
              </a>
            ))}
          </nav>
        </header>

        <section id="summary" className="scroll-mt-24 rounded-2xl bg-[#1B4332] p-5 sm:p-7 text-white">
          <h2 className="text-xl md:text-2xl font-bold">한눈에 보기</h2>
          <ul className="mt-4 space-y-3 text-base leading-[1.7] break-keep">
            <li>
              <b>안전요원 기준은 지역마다 다릅니다.</b> 인천·충북은 학생 150명 이상일 때 50명당 1명, 경기는 수학여행이면 규모와 관계없이 50명당 1명입니다.
            </li>
            <li>
              <b>바뀔 예정인 것</b> — 교육부는 안전보조인력을 학급당 1명 수준으로 늘리고, 고의·중과실이 없으면 교사가 책임지지 않도록 법 개정을 추진합니다(2027년 상반기 시행 목표).
            </li>
            <li>
              <b>비용 지원</b> — 인천은 다른 지역 학교에 차량 임차비를 최대 500만 원까지 지원합니다. 시·군 단체관광 인센티브는 여행사를 통해 적용받을 수 있습니다.
            </li>
            <li>
              <b>계약</b> — 추정가격 2천만 원 이하 용역은 1인 견적 수의계약이 가능합니다.
            </li>
          </ul>
        </section>

        <Section
          id="safety"
          title="1. 지역별 안전요원·인솔 기준"
          lead="같은 수학여행이라도 교육청마다 규모를 나누는 기준과 안전요원 수가 다릅니다. 매뉴얼 원문 기준으로 비교했습니다."
        >
          <RegionCompare />
          <ul className="list-disc space-y-1.5 pl-5">
            <li>모든 현장체험학습은 실시 전에 학교운영위원회 심의(자문)를 거칩니다.</li>
            <li>충북은 숙박형 체험학습에 학생·학부모 동의 80% 이상을 받도록 정하고 있습니다.</li>
            <li>안전요원 최소 기준을 채우기 어려우면, 기타 보조인력을 배치하고 추가 안전대책을 세우도록 안내합니다(충북).</li>
          </ul>
          <Note title="2026년 5월 교육부 발표 — 바뀔 예정인 내용">
            <ul className="list-disc space-y-1 pl-5">
              <li>안전보조인력을 <b>학생 50명당 1명에서 학급당 1명 수준</b>으로 늘려 지원</li>
              <li>교육지원청 전담 인력 확대(2027년 200명 추가) — 계약, 보조인력 배정, 안전점검 지원</li>
              <li>매뉴얼 간소화, 체험시설·차량 안전점검을 지자체와 함께 실시</li>
            </ul>
            <p className="mt-2 text-sm text-text-gray">아직 시행 전입니다. 적용 시기는 소속 교육청 공문으로 확인해 주세요.</p>
          </Note>
          <Src ids={["incheonManual", "gyeonggiGuide", "chungbukManual", "moeBriefing", "moeNews"]} />
        </Section>

        <Section
          id="support"
          title="2. 지역별 교육청·지자체 지원"
          lead="교육청 안내와 함께, 학교가 이용할 수 있는 지자체·정부 지원을 지역별로 모았습니다. 지원 내용과 예산은 해마다 바뀌니 신청 전 최신 공고를 확인해 주세요."
        >
          <div className="space-y-4">
            <RegionCard region="인천">
              <SupportItem who="지자체" title="인천관광공사 「수요자 맞춤형 인천 교육여행 지원제도」">
                수학여행·현장체험학습으로 인천을 찾는 <b>인천 외 지역 초·중·고</b>에 차량 임차비를 지원합니다.
                당일 여행 최대 <b>200만 원</b>, 숙박 여행 최대 <b>500만 원</b>이며 선착순입니다(2026년 3월 발표). 신청은 인천관광공사 누리집에서 합니다.
              </SupportItem>
              <SupportItem who="교육청" title="대규모 수학여행 사전 점검">
                학생 150명 이상 수학여행은 시교육청 수학여행안전지원단 등의 점검·컨설팅을 거쳐 실시합니다.
              </SupportItem>
            </RegionCard>

            <RegionCard region="경기">
              <SupportItem who="교육청" title="외부 안전요원 확보 경로">
                경기교육모아 현장체험학습 안전요원 인력풀, 크레존, 워크넷 등을 활용하거나, 업체와 계약할 때 안전요원 배치를 계약 조건에 넣습니다.
                계약 시 자격증·연수이수증을 확인합니다.
              </SupportItem>
              <SupportItem who="지자체" title="가평군 단체관광객 유치 인센티브 (2026)">
                단체관광객을 유치한 여행사에 지원하는 제도입니다. 학교가 직접 신청하지 않고, 계약한 여행사가 신청합니다.
              </SupportItem>
            </RegionCard>

            <RegionCard region="충북">
              <SupportItem who="교육청" title="계약·차량 확인 사항">
                계약 시 표준약관을 적용하고 업체의 영업배상보험 가입 여부를 확인합니다. 학생이 탈 차량은 출발 전 운전자 음주 여부를 확인합니다.
              </SupportItem>
              <SupportItem who="지자체" title="괴산군 단체관광객 유치 여행사 인센티브 (2026)">
                괴산을 찾는 단체를 유치한 여행사에 지원하는 제도로, 여행사가 신청합니다.
              </SupportItem>
            </RegionCard>

            <RegionCard region="전국">
              <SupportItem who="정부" title="문화체육관광부·한국관광공사 「청소년 교육여행 지원」">
                2026년에는 초등 4학년 이상~고등학생 약 9,000명에게 <b>1인당 약 4만 5천 원</b>을 지원했습니다. 입장료, 체험비, 차량 임차료 등에 쓸 수 있습니다.
                올해 신청은 3월 27일에 마감됐고, 내년 공고는 한국관광공사에서 확인하실 수 있습니다.
              </SupportItem>
            </RegionCard>
          </div>
          <Note title="여행사를 통해 받을 수 있는 지원도 확인해 보세요">
            가평·괴산처럼 많은 시·군이 여행사를 대상으로 단체관광 인센티브를 운영합니다. 업체를 정하실 때 방문 지역의 인센티브를 적용할 수 있는지 물어보시면 학생 부담을 줄이는 데 도움이 됩니다.
          </Note>
          <Src ids={["incheonSupport", "incheonManual", "gyeonggiGuide", "gapyeongIncentive", "chungbukManual", "goesanIncentive", "youthTrip"]} />
        </Section>

        <Section id="contract" title="3. 업체 계약 방법" lead="수의계약 견적 기준은 지방계약법 시행령 제30조를 따릅니다. 추정가격은 부가가치세를 뺀 금액입니다.">
          <Table
            head={["추정가격 (용역)", "계약 방법"]}
            minWidth={420}
            rows={[
              ["2천만 원 이하", "1인 견적 수의계약 가능"],
              ["5천만 원 이하", "여성기업·장애인기업·사회적기업 등과 계약하면 1인 견적 가능"],
              ["그 밖의 수의계약", "2인 이상에게 견적을 받음"],
              ["그보다 큰 규모", "대부분 나라장터 입찰로 업체 선정"],
            ]}
          />
          <ul className="list-disc space-y-1.5 pl-5">
            <li>여러 학교가 함께 가면서 추정가격을 합쳐 2천만 원을 넘으면, 학교별로 나누어 수의계약할 수 없습니다(충북 매뉴얼).</li>
            <li>학교·교육청 자체 지침이 법령보다 엄격할 수 있으니 행정실 기준도 함께 확인해 주세요.</li>
          </ul>
          <Src ids={["contractLaw", "chungbukManual"]} />
        </Section>

        <Section
          id="bids"
          title="4. 최근 학교 입찰 공고 경향"
          lead="2026년 10월 말~11월 초 나라장터에 올라온 초·중·고·교육청 교육여행 입찰 공고 69건의 첨부 공고문을 정리했습니다. 공고문을 만드실 때 참고하실 수 있습니다."
        >
          <Table
            head={["항목", "경향"]}
            minWidth={420}
            rows={[
              ["입찰 방식", "69건 중 63건이 2단계 입찰(규격·가격)"],
              ["평가 방식", "제안서 평가를 통과한 업체 중 최저가 낙찰. 통과 점수는 80점(50건)이 가장 많고 85점(12건)이 뒤를 이음"],
              ["참가 지역 제한", "69건 중 64건이 본점 소재지로 지역 제한"],
              ["자주 넣는 조건", "안전요원 배치(56건), 보험 가입(52건), 숙소 등급(25건)"],
              ["국내 1인당 기초금액", "중간값 약 66만 원 (국내 공고 53건, 학생·교원 합산 인원 기준)"],
            ]}
          />
          <p className="text-xs text-text-gray">집계: 터치더월드가 나라장터 공개 공고와 첨부 공고문을 모아 정리 (2026.10.28~11.07 수집분)</p>
        </Section>

        <Section id="bus" title="5. 전세버스 이용">
          <p>
            2023년 ‘노란버스’ 논란 이후 도로교통법이 개정되어(2023년 10월 국회 통과, 공포 즉시 시행), 현장체험학습처럼 <b>비상시적으로 이루어지는 교육활동을 위한 이동</b>은 어린이통학버스 이용 범위에서 빠졌습니다.
            현장체험학습에는 일반 전세버스를 이용하실 수 있습니다.
          </p>
          <p>출발 전에는 운전자 음주 여부를 확인하도록 안내하는 교육청이 많습니다(충북 매뉴얼 등).</p>
          <Src ids={["busLaw", "busLawPassed", "chungbukManual"]} />
        </Section>

        <Section id="immunity" title="6. 교원 면책 규정">
          <Table
            head={["구분", "내용"]}
            minWidth={420}
            rows={[
              [
                "현행",
                <>학교안전법 제10조 제5항(2024.12 신설, 2025.12 개정): 학교장, 교직원, 보조인력이 안전사고관리 지침에 따라 <b>학생에 대한 안전조치 의무를 다한 경우</b> 학교안전사고에 대해 민·형사상 책임을 지지 않습니다.</>,
              ],
              [
                "개정 추진",
                <>교육부는 2026년 5월, <b>고의 또는 중과실이 없으면</b> 책임을 지지 않도록 면책 범위를 넓히는 개정을 발표했습니다. 2027년 상반기 시행이 목표이며, 사고가 나면 교육청 전담팀과 전담 변호사가 처음부터 지원하도록 바꿀 계획입니다.</>,
              ],
            ]}
          />
          <p className="text-sm text-text-gray">국회 통과와 시행일은 국가법령정보센터에서 최신 내용을 확인해 주세요.</p>
          <Src ids={["schoolSafetyLaw", "chungbukManual", "moeBriefing", "moeNews"]} />
        </Section>

        <Section id="checklist" title="7. 준비 순서 한눈에 보기">
          <ol className="list-decimal space-y-2 pl-5">
            <li>학생·학부모 수요 조사, 규모와 유형(학년 단위·소규모 테마형) 결정</li>
            <li>운영 계획서 작성, 현장체험학습 활성화위원회 검토와 학교운영위원회 심의</li>
            <li>업체 선정 — 금액에 따라 견적 비교(수의계약) 또는 나라장터 입찰, 지자체 지원·인센티브 확인</li>
            <li>사전답사 — 숙소·차량·체험시설 안전 점검, 대규모·국외는 교육청 컨설팅</li>
            <li>가정통신문·참가 동의서, 학생 안전교육, 비상연락망·여행자보험 확인</li>
            <li>실시 후 결과·정산 보고, 만족도 조사</li>
          </ol>
          <div className="grid gap-3 sm:grid-cols-2">
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
                <span className="block text-sm text-text-gray">학년·인원·지역을 알려 주시면 지원 제도까지 맞춰 일정을 보내 드려요</span>
              </span>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-text-gray group-hover:text-brand-green-primary" />
            </Link>
          </div>
        </Section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <h2 className="text-lg font-bold text-text-dark">출처 모음</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.values(SOURCES).map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-text-dark underline underline-offset-2 hover:text-brand-green-primary">
                  {s.label}
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-text-gray">
            이 페이지는 공개 자료를 정리한 참고용 안내이며 법적 해석이 아닙니다. 실제 운영은 소속 교육청의 올해 지침과 학교 규정을 따라 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}

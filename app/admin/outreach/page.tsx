import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSchoolTrips, hasNeisKey } from "@/lib/neis";
import { CONTACT_END_DAYS, CONTACT_START_DAYS, planTrips, schoolFromAgency, urgency, type TripPlan } from "@/lib/outreach";
import { seoulEligible, type NoticeSummary } from "@/lib/g2b-summary";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const STATUS: Record<TripPlan["status"], { label: string; className: string }> = {
  now: { label: "지금 연락", className: "bg-brand-green-primary text-white" },
  soon: { label: "곧 연락 시기", className: "bg-amber-100 text-amber-800" },
  late: { label: "연락 시기 지남", className: "bg-gray-200 text-gray-700" },
  later: { label: "예정", className: "bg-gray-100 text-text-gray" },
};

// 나이스에 없는 단체(교장단·학회 등)·대학은 제외
const isK12 = (name: string) => /(초등학교|중학교|고등학교|학교|고|중|초)$/.test(name) && !/대학교$/.test(name);

/** 지난 학년도 3월 1일부터 오늘까지 — 작년 행사와 올해 행사를 함께 본다 */
function scheduleRange(today: Date) {
  const y = today.getFullYear() - (today.getMonth() >= 2 ? 1 : 2);
  const ymd = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }).replaceAll("-", "");
  return { from: `${y}0301`, to: ymd(today) };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

const BIDS_PER_PAGE = 10;

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; bidPage?: string; bids?: string }>;
}) {
  const { q, bidPage, bids } = await searchParams;
  const today = new Date();
  const { from, to } = scheduleRange(today);

  const [schools, inquiries, notices] = await Promise.all([
    prisma.school.findMany({ select: { name: true, events: { select: { date: true }, orderBy: { date: "desc" }, take: 1 } } }),
    prisma.inquiry.findMany({ select: { schoolName: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    // 나라장터 입찰 알림이 모은 공고 중 아직 마감 전인 것 — 지금 업체를 찾고 있는 학교
    prisma.g2BNotice.findMany({
      where: { deadline: { gte: today } },
      select: { noticeId: true, title: true, agency: true, budget: true, deadline: true, url: true, aiSummary: true },
      orderBy: { deadline: "asc" },
    }),
  ]);
  const relation = new Map<string, string>();
  for (const s of schools) if (s.events[0]) relation.set(s.name, `진행 ${s.events[0].date.toISOString().slice(0, 10)}`);
  for (const i of inquiries) if (!relation.has(i.schoolName)) relation.set(i.schoolName, `문의 ${i.createdAt.toISOString().slice(0, 10)}`);

  const openBids = notices.flatMap((n) => {
    const school = schoolFromAgency(n.agency);
    const summary = (n.aiSummary ?? null) as NoticeSummary | null;
    return school ? [{ ...n, school, summary, eligible: seoulEligible(summary) }] : [];
  });
  const biddingSchools = new Set(openBids.map((b) => b.school));
  const kstDate = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }).slice(5).replace("-", "/");
  const budgetText = (b: bigint | null) => (b ? `${(Number(b) / 100_000_000).toFixed(2)}억` : "-");
  // 마감일까지 남은 날 — 시각은 빼고 한국 날짜끼리 비교한다
  const kstDay = (d: Date) => new Date(d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })).getTime();
  const dday = (d: Date) => Math.round((kstDay(d) - kstDay(today)) / 86_400_000);

  // 공고가 수십 건이라 한 표에 몰아 두면 읽기 어려워 10건씩 나눠 카드로 보여 준다
  const eligibleOnly = bids === "eligible";
  const shownBids = eligibleOnly ? openBids.filter((b) => b.eligible) : openBids;
  const bidPages = Math.max(1, Math.ceil(shownBids.length / BIDS_PER_PAGE));
  const currentBidPage = Math.min(bidPages, Math.max(1, Number(bidPage) || 1));
  const pageBids = shownBids.slice((currentBidPage - 1) * BIDS_PER_PAGE, currentBidPage * BIDS_PER_PAGE);
  const bidHref = (page: number, filter = bids) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filter) params.set("bids", filter);
    if (page > 1) params.set("bidPage", String(page));
    const qs = params.toString();
    return `/admin/outreach${qs ? `?${qs}` : ""}#bids`;
  };

  // 키가 없으면 학교 하나 조회에도 수십 번 호출해야 해, 목록 전체 대신 검색한 학교만 본다
  const targets = q?.trim()
    ? [q.trim()]
    : hasNeisKey
      ? [...new Set([...schools.map((s) => s.name), ...inquiries.map((i) => i.schoolName)])].filter(isK12)
      : [];

  const results = await mapLimit(targets, 4, async (name) => {
    try {
      const data = await getSchoolTrips(name, from, to);
      return { name, data, plans: data ? planTrips(data.events, today) : [], error: null as string | null };
    } catch (e) {
      return { name, data: null, plans: [] as TripPlan[], error: e instanceof Error ? e.message : String(e) };
    }
  });
  results.sort((a, b) => urgency(a.plans) - urgency(b.plans) || (a.plans[0]?.contactFrom ?? "9").localeCompare(b.plans[0]?.contactFrom ?? "9"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">학교별 연락 시기</h1>
        <p className="mt-1 text-sm text-text-gray">
          나이스 학사일정의 체험학습·수학여행·수련활동 날짜를 보고, 다음 해 같은 행사 {CONTACT_START_DAYS}~{CONTACT_END_DAYS}일 전을 연락 시기로 표시합니다.
          대상: 진행 내역·문의 학교 (단체·대학 제외). 학사일정 기간 {from.slice(0, 4)}.{from.slice(4, 6)}~오늘.
        </p>
      </div>

      {!hasNeisKey && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          나이스 인증키(NEIS_API_KEY)가 없어 <b>검색한 학교만</b> 조회합니다. 키가 없으면 포털이 한 번에 5건씩만 주어 학교 하나를 수십 번 나눠 조회합니다.
          <a href="https://open.neis.go.kr" target="_blank" rel="noopener noreferrer" className="ml-1 underline">open.neis.go.kr</a>에서 무료로 발급받아 환경변수에 넣으면 전체 목록이 자동으로 나옵니다.
        </div>
      )}

      <section id="bids" className="scroll-mt-20 rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              지금 입찰 진행 중인 학교{" "}
              <span className="text-sm font-normal text-text-gray">
                {openBids.length}건 · 서울 본점 참여 가능 {openBids.filter((b) => b.eligible).length}건
              </span>
            </h2>
            <p className="mt-1 text-xs text-text-gray leading-relaxed">
              나라장터 입찰 알림이 모은 초·중·고 공고 중 마감 전인 것입니다. 아래 요약은 첨부 공고문을 AI가 정리한 것이라 참여 전 원문을 꼭 확인하세요.
            </p>
          </div>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
            <Link href={bidHref(1, undefined)} className={`rounded-md px-3 py-1.5 ${!eligibleOnly ? "bg-white font-semibold shadow-sm" : "text-text-gray"}`}>전체</Link>
            <Link href={bidHref(1, "eligible")} className={`rounded-md px-3 py-1.5 ${eligibleOnly ? "bg-white font-semibold shadow-sm" : "text-text-gray"}`}>참여 가능만</Link>
          </div>
        </div>

        {pageBids.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-text-gray">
            {eligibleOnly ? "서울 본점이 참여할 수 있는 마감 전 공고가 없습니다." : "마감 전인 학교 공고가 없습니다."}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pageBids.map((b) => {
              const left = b.deadline ? dday(b.deadline) : null;
              const fields: [string, string | null | undefined][] = b.summary
                ? [
                    ["기간", b.summary.기간],
                    ["장소", b.summary.장소],
                    ["인원", b.summary.인원],
                    ["1인당", b.summary["1인당"]],
                    ["지역 제한", b.summary.지역제한],
                    ["제안서 마감", b.summary.제안서마감],
                  ]
                : [];
              return (
                <li key={b.noticeId} className="px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-1 font-semibold ${left !== null && left <= 3 ? "bg-red-50 text-red-700" : "bg-gray-100 text-text-dark"}`}>
                      마감 {b.deadline ? kstDate(b.deadline) : "-"}
                      {left !== null && ` · D-${Math.max(0, left)}`}
                    </span>
                    {b.eligible === true && <span className="rounded-full bg-brand-green-primary/10 px-2.5 py-1 font-semibold text-brand-green-primary">서울 본점 참여 가능</span>}
                    {b.eligible === false && <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">지역 제한으로 참여 불가</span>}
                    <span className="ml-auto text-sm font-semibold text-text-dark">추정 {budgetText(b.budget)}</span>
                  </div>

                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-base font-semibold leading-snug text-text-dark hover:underline break-keep">
                    {b.title}
                  </a>
                  <p className="mt-1 text-sm text-text-gray">
                    <Link href={`/admin/outreach?q=${encodeURIComponent(b.school)}`} className="font-medium text-brand-green-primary hover:underline">{b.school}</Link>
                    {relation.get(b.school) && <span className="ml-2">우리와의 이력: {relation.get(b.school)}</span>}
                  </p>

                  {b.summary ? (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <dl className="grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
                        {fields.filter(([, v]) => v).map(([label, v]) => (
                          <div key={label} className="flex gap-3">
                            <dt className="w-20 flex-shrink-0 text-text-gray">{label}</dt>
                            <dd className={`text-text-dark break-keep ${label === "지역 제한" && b.eligible === false ? "font-semibold text-red-700" : ""}`}>{v}</dd>
                          </div>
                        ))}
                        {b.summary.평가방식 && (
                          <div className="flex gap-3 sm:col-span-2">
                            <dt className="w-20 flex-shrink-0 text-text-gray">평가 방식</dt>
                            <dd className="text-text-dark break-keep">{b.summary.평가방식}</dd>
                          </div>
                        )}
                        {b.summary.특이사항 && (
                          <div className="flex gap-3 sm:col-span-2">
                            <dt className="w-20 flex-shrink-0 text-text-gray">특이사항</dt>
                            <dd className="text-text-dark break-keep">{b.summary.특이사항}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-text-gray">첨부 공고문이 PDF가 아니라(HWP 등) 요약하지 않았습니다. 공고 원문에서 확인해 주세요.</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {bidPages > 1 && (
          <nav className="flex items-center justify-center gap-1 border-t border-gray-100 px-5 py-4 text-sm" aria-label="입찰 공고 페이지">
            {currentBidPage > 1 && <Link href={bidHref(currentBidPage - 1)} className="rounded-md px-3 py-1.5 hover:bg-gray-100">이전</Link>}
            {Array.from({ length: bidPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={bidHref(n)}
                aria-current={n === currentBidPage ? "page" : undefined}
                className={`min-w-9 rounded-md px-3 py-1.5 text-center ${n === currentBidPage ? "bg-brand-green-primary font-semibold text-white" : "hover:bg-gray-100"}`}
              >
                {n}
              </Link>
            ))}
            {currentBidPage < bidPages && <Link href={bidHref(currentBidPage + 1)} className="rounded-md px-3 py-1.5 hover:bg-gray-100">다음</Link>}
          </nav>
        )}
      </section>

      <form className="flex gap-2" action="/admin/outreach">
        <input name="q" defaultValue={q ?? ""} placeholder="학교 이름으로 검색 (예: 안양문화고등학교)" className="h-10 w-full max-w-md rounded-lg border border-gray-300 px-3 text-sm" />
        <button className="h-10 rounded-lg bg-brand-green-primary px-4 text-sm font-semibold text-white">조회</button>
        {q && <Link href="/admin/outreach" className="flex h-10 items-center px-2 text-sm text-text-gray hover:underline">전체 목록</Link>}
      </form>

      <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-gray-50 text-left text-xs text-text-gray">
            <tr>
              <th className="px-4 py-3">학교</th>
              <th className="px-4 py-3">행사 (지난 날짜)</th>
              <th className="px-4 py-3">다음 예상일</th>
              <th className="px-4 py-3">연락 시기</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">우리와의 이력</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-text-gray">{hasNeisKey ? "대상 학교가 없습니다." : "학교 이름을 검색해 주세요."}</td></tr>
            )}
            {results.map(({ name, data, plans, error }) => {
              const info = (
                <td className="px-4 py-3 align-top" rowSpan={Math.max(1, plans.length)}>
                  <p className="font-medium">{data?.school.name ?? name}</p>
                  {biddingSchools.has(data?.school.name ?? name) && (
                    <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">입찰 진행 중</span>
                  )}
                  {data && <p className="text-xs text-text-gray">{data.school.officeName} · {data.school.kind}</p>}
                  {data?.school.phone && <p className="text-xs text-text-gray">☎ {data.school.phone}</p>}
                  {data?.school.homepage && <a href={data.school.homepage} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-green-primary hover:underline">학교 홈페이지</a>}
                </td>
              );
              const rel = <td className="px-4 py-3 align-top text-xs text-text-gray" rowSpan={Math.max(1, plans.length)}>{relation.get(name) ?? "-"}</td>;
              if (plans.length === 0) {
                return (
                  <tr key={name}>
                    {info}
                    <td colSpan={4} className="px-4 py-3 text-xs text-text-gray">
                      {error ? `조회 실패: ${error}` : !data ? "나이스에서 학교를 찾지 못했습니다" : "학사일정에 교육여행성 행사가 없습니다"}
                    </td>
                    {rel}
                  </tr>
                );
              }
              return plans.map((p, idx) => (
                <tr key={`${name}-${p.name}-${p.lastDate}`}>
                  {idx === 0 && info}
                  <td className="px-4 py-3">{p.name}<span className="block text-xs text-text-gray">{p.lastDate}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.expectedDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{p.contactFrom} ~ {p.contactTo}</td>
                  <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[p.status].className}`}>{STATUS[p.status].label}</span></td>
                  {idx === 0 && rel}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </section>
      <p className="text-xs text-text-gray">학교가 학사일정에 행사를 올리지 않았거나 이름을 다르게 적은 경우는 잡히지 않습니다. 조회 결과는 7일 동안 저장해 다시 쓰입니다.</p>
    </div>
  );
}

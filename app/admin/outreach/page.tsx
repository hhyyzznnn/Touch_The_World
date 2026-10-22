import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSchoolTrips, hasNeisKey } from "@/lib/neis";
import { CONTACT_END_DAYS, CONTACT_START_DAYS, planTrips, urgency, type TripPlan } from "@/lib/outreach";

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

export default async function OutreachPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const today = new Date();
  const { from, to } = scheduleRange(today);

  const [schools, inquiries] = await Promise.all([
    prisma.school.findMany({ select: { name: true, events: { select: { date: true }, orderBy: { date: "desc" }, take: 1 } } }),
    prisma.inquiry.findMany({ select: { schoolName: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const relation = new Map<string, string>();
  for (const s of schools) if (s.events[0]) relation.set(s.name, `진행 ${s.events[0].date.toISOString().slice(0, 10)}`);
  for (const i of inquiries) if (!relation.has(i.schoolName)) relation.set(i.schoolName, `문의 ${i.createdAt.toISOString().slice(0, 10)}`);

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

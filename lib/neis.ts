import { unstable_cache } from "next/cache";
import type { ScheduleEvent } from "./outreach";
import { isTripEvent } from "./outreach";

/**
 * 나이스 교육정보 개방 포털 (https://open.neis.go.kr) — 학교 기본정보·학사일정.
 * 인증키(NEIS_API_KEY)가 없으면 포털이 한 번에 5건만 돌려주는 샘플 모드라,
 * 키 없이는 기간을 일주일 단위로 쪼개 조회한다(학교 하나 검색할 때만 쓸 수 있는 속도).
 */
const BASE = "https://open.neis.go.kr/hub";
const KEY = process.env.NEIS_API_KEY;
export const hasNeisKey = !!KEY;

export interface NeisSchool {
  officeCode: string;
  schoolCode: string;
  name: string;
  officeName: string;
  kind: string;
  address: string;
  phone: string;
  homepage: string;
}

type Row = Record<string, string>;

async function call(service: string, params: Record<string, string>, pSize: number): Promise<{ rows: Row[]; total: number }> {
  const q = new URLSearchParams({ Type: "json", pIndex: "1", pSize: String(KEY ? pSize : 5), ...(KEY ? { KEY } : {}), ...params });
  const res = await fetch(`${BASE}/${service}?${q}`, { cache: "no-store" });
  const json = (await res.json()) as Record<string, unknown>;
  const body = json[service] as [{ head: [{ list_total_count: number }] }, { row: Row[] }] | undefined;
  if (!body) return { rows: [], total: 0 }; // INFO-200(데이터 없음) 등
  return { rows: body[1].row, total: body[0].head[0].list_total_count };
}

export async function findSchool(name: string): Promise<NeisSchool | null> {
  const { rows } = await call("schoolInfo", { SCHUL_NM: name }, 10);
  if (rows.length === 0) return null;
  const pick = rows.find((r) => r.SCHUL_NM === name) ?? rows[0];
  return {
    officeCode: pick.ATPT_OFCDC_SC_CODE,
    schoolCode: pick.SD_SCHUL_CODE,
    name: pick.SCHUL_NM,
    officeName: pick.ATPT_OFCDC_SC_NM,
    kind: pick.HS_SC_NM && pick.HS_SC_NM !== "일반고" ? pick.HS_SC_NM : pick.SCHUL_KND_SC_NM,
    address: pick.ORG_RDNMA ?? "",
    phone: pick.ORG_TELNO ?? "",
    homepage: pick.HMPG_ADRES ?? "",
  };
}

const ymd = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }).replaceAll("-", "");

/** 기간 안의 교육여행성 행사만 돌려준다 */
export async function fetchTripEvents(school: NeisSchool, from: Date, to: Date): Promise<ScheduleEvent[]> {
  const base = { ATPT_OFCDC_SC_CODE: school.officeCode, SD_SCHUL_CODE: school.schoolCode };
  const windows: [Date, Date][] = [];
  const step = KEY ? 366 : 7; // 키가 있으면 1년(최대 1,000건) 한 번에, 없으면 일주일씩
  for (let start = new Date(from); start <= to; start = new Date(start.getTime() + step * 86400000)) {
    windows.push([start, new Date(Math.min(start.getTime() + (step - 1) * 86400000, to.getTime()))]);
  }
  const events: ScheduleEvent[] = [];
  const collect = (rows: Row[]) => {
    for (const r of rows) if (isTripEvent(r.EVENT_NM)) events.push({ date: r.AA_YMD, name: r.EVENT_NM.trim() });
  };
  for (const [s, e] of windows) {
    const { rows, total } = await call("SchoolSchedule", { ...base, AA_FROM_YMD: ymd(s), AA_TO_YMD: ymd(e) }, 1000);
    if (total > rows.length && !KEY) {
      // 샘플 모드에서 한 주에 5건을 넘으면 잘리므로 그 주만 하루씩 다시 조회
      for (let d = new Date(s); d <= e; d = new Date(d.getTime() + 86400000)) {
        collect((await call("SchoolSchedule", { ...base, AA_FROM_YMD: ymd(d), AA_TO_YMD: ymd(d) }, 5)).rows);
      }
    } else {
      collect(rows);
    }
  }
  return events;
}

/** 학교 이름 → 기본정보 + 최근 1년 반 교육여행성 행사 (7일 캐시) */
export const getSchoolTrips = unstable_cache(
  async (name: string, fromYmd: string, toYmd: string) => {
    const school = await findSchool(name);
    if (!school) return null;
    const toD = (v: string) => new Date(`${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T00:00:00+09:00`);
    const events = await fetchTripEvents(school, toD(fromYmd), toD(toYmd));
    return { school, events };
  },
  ["neis-school-trips-v1"],
  { revalidate: 7 * 24 * 60 * 60 },
);

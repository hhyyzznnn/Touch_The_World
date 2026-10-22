/**
 * 학교별 연락 시기 — 학사일정(NEIS)에 올라온 체험학습·수학여행 등 행사 날짜로
 * "다음 해 같은 행사 전에 언제 연락하면 좋은지"를 계산한다. 외부 호출 없는 순수 로직.
 */

/** 학사일정 행사명에 이 단어가 있으면 교육여행성 행사로 본다 */
export const TRIP_KEYWORDS = [
  "수학여행", "현장체험", "체험학습", "수련활동", "수련회", "교육여행", "졸업여행",
  "국외", "해외", "캠프", "문화탐방", "테마여행", "숙박형", "글로벌", "국제교류",
];
/** 학생 개인 결석 처리 등 여행 업체와 무관한 행사 */
const EXCLUDE_KEYWORDS = ["교외체험", "가정체험", "신청서", "보고서 제출", "사전교육", "설명회", "연수원"];

export function isTripEvent(name: string): boolean {
  const n = name.replace(/\s+/g, "");
  return TRIP_KEYWORDS.some((k) => n.includes(k)) && !EXCLUDE_KEYWORDS.some((k) => n.includes(k.replace(/\s+/g, "")));
}

export interface ScheduleEvent {
  /** YYYYMMDD */
  date: string;
  name: string;
}

export interface TripPlan {
  name: string;
  /** 지난 행사 날짜 (YYYY-MM-DD) */
  lastDate: string;
  /** 다음 같은 행사 예상일 */
  expectedDate: string;
  contactFrom: string;
  contactTo: string;
  status: "now" | "soon" | "late" | "later";
}

// 학교가 업체를 알아보기 시작하는 시점 — 행사 4개월 전부터 2개월 전까지를 연락 시기로 본다.
export const CONTACT_START_DAYS = 120;
export const CONTACT_END_DAYS = 60;
const SOON_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

const toDate = (ymd: string) => new Date(`${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00+09:00`);
const fmt = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

/**
 * 같은 이름(공백 무시)의 행사는 가장 최근 날짜 하나로 묶고, 여러 날 이어지는 행사는 첫날만 쓴다.
 * 그 날짜를 해마다 반복된다고 보고, 오늘 이후 처음 돌아오는 날을 예상일로 잡는다.
 */
export function planTrips(events: ScheduleEvent[], today = new Date()): TripPlan[] {
  const trips = events.filter((e) => isTripEvent(e.name)).sort((a, b) => a.date.localeCompare(b.date));
  const byName = new Map<string, ScheduleEvent>();
  let prev: ScheduleEvent | null = null;
  for (const e of trips) {
    const key = e.name.replace(/\s+/g, "");
    // 연속된 날짜의 같은 행사(2박 3일 등)는 첫날로
    if (prev && prev.name.replace(/\s+/g, "") === key && toDate(e.date).getTime() - toDate(prev.date).getTime() <= 3 * DAY) {
      prev = e;
      continue;
    }
    byName.set(key, e);
    prev = e;
  }

  const plans = [...byName.values()].map((e) => {
    const last = toDate(e.date);
    const expected = new Date(last);
    // 행사가 이미 지났으면 다음 해 같은 날짜를 기준으로 한다.
    // (연락 시기만 지나고 행사가 아직이면 그해 날짜를 유지해 "늦음"으로 보여준다)
    while (expected.getTime() < today.getTime()) expected.setFullYear(expected.getFullYear() + 1);
    const from = new Date(expected.getTime() - CONTACT_START_DAYS * DAY);
    const to = new Date(expected.getTime() - CONTACT_END_DAYS * DAY);
    const t = today.getTime();
    const status: TripPlan["status"] =
      t >= from.getTime() && t <= to.getTime() ? "now" : t >= from.getTime() - SOON_DAYS * DAY && t < from.getTime() ? "soon" : t > to.getTime() ? "late" : "later";
    return { name: e.name, lastDate: fmt(last), expectedDate: fmt(expected), contactFrom: fmt(from), contactTo: fmt(to), status };
  });
  // 해마다 이름이 조금 다른 같은 행사("교과별체험학습활동" → "교과 체험학습의 날")는
  // 예상일이 3주 안으로 겹치면 하나로 보고, 가장 최근에 열린 쪽 이름을 남긴다.
  plans.sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  const merged: TripPlan[] = [];
  for (const p of plans) {
    const dup = merged.some((m) => Math.abs(new Date(m.expectedDate).getTime() - new Date(p.expectedDate).getTime()) <= 21 * DAY);
    if (!dup) merged.push(p);
  }
  return merged.sort((a, b) => a.contactFrom.localeCompare(b.contactFrom));
}

const STATUS_ORDER: Record<TripPlan["status"], number> = { now: 0, soon: 1, later: 2, late: 3 };
/** 학교 목록 정렬용 — 가장 급한 행사 기준 */
export function urgency(plans: TripPlan[]): number {
  if (plans.length === 0) return 99;
  return Math.min(...plans.map((p) => STATUS_ORDER[p.status]));
}

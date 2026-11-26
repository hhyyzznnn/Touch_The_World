import assert from "node:assert/strict";
import test from "node:test";
import { groupSameNotices } from "@/lib/g2b-notification";

test("같은 학교·같은 제목·같은 마감 공고(공고번호만 다름)는 메일에서 한 건으로 묶는다", () => {
  const d = new Date("2026-12-16T01:00:00Z");
  const base = { agency: "울산광역시강남교육청 신정중학교", deadline: d };
  const grouped = groupSameNotices([
    { ...base, title: "2027학년도 신정중 2학년 수학여행 위탁 용역 입찰 공고 ", noticeId: "a" },
    { ...base, title: "2027학년도 신정중 2학년 수학여행 위탁 용역 입찰 공고", noticeId: "b" },
    { ...base, title: "2027학년도 신정중 2학년 수학여행 위탁 용역 입찰 공고", noticeId: "c" },
    { ...base, title: "2027학년도 신정중 1학년 수련활동", noticeId: "d" },
    { ...base, title: "2027학년도 신정중 2학년 수학여행 위탁 용역 입찰 공고", deadline: new Date("2026-12-20T01:00:00Z"), noticeId: "e" },
  ]);
  assert.equal(grouped.length, 3);
  assert.equal(grouped[0].sameCount, 3);
  assert.equal(grouped[0].noticeId, "a");
});

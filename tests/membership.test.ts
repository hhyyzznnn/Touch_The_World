import assert from "node:assert/strict";
import test from "node:test";
import { MEMBERSHIP_BUNDLES, MEMBERSHIP_INTERESTS, parseMembershipInput } from "@/lib/membership";

const valid = {
  name: "김선생",
  schoolName: "OO고등학교",
  email: "Teacher@School.kr ",
  privacyConsent: true,
  interests: ["업무 자료", "없는 항목"],
  position: "부장교사",
  schoolLevel: "아무거나",
  newsletterOptIn: true,
};

test("개인정보 동의 없이는 가입할 수 없다", () => {
  assert.deepEqual(parseMembershipInput({ ...valid, privacyConsent: false }), { error: "개인정보 수집·이용에 동의해주세요." });
});

test("이메일은 소문자로 정리하고, 목록에 없는 선택값은 버린다", () => {
  const result = parseMembershipInput(valid);
  assert.ok("data" in result);
  assert.equal(result.data.email, "teacher@school.kr");
  assert.deepEqual(result.data.interests, ["업무 자료"]);
  assert.equal(result.data.position, "부장교사");
  assert.equal(result.data.schoolLevel, null);
  assert.equal(result.data.pilotInterest, false);
});

test("이메일 형식이 틀리면 거절한다", () => {
  assert.ok("error" in parseMembershipInput({ ...valid, email: "abc" }));
});

test("혜택 묶음은 관심 분야 목록과 1:1로 맞는다", () => {
  assert.deepEqual(MEMBERSHIP_BUNDLES.map((b) => b.key), [...MEMBERSHIP_INTERESTS]);
});

test("단계 카드의 대표 혜택은 전체 혜택 목록에 같은 단계로 들어 있다", async () => {
  const { MEMBERSHIP_TIERS } = await import("@/lib/membership");
  const all = MEMBERSHIP_BUNDLES.flatMap((b) => b.items);
  for (const t of MEMBERSHIP_TIERS) {
    for (const name of t.keyBenefits) {
      assert.equal(all.find((i) => i.name === name)?.tier, t.tier, name);
    }
  }
});

test("사이트 안 진입 자리는 정해 둔 값만 받는다", async () => {
  const { parseEntryPoint } = await import("@/lib/membership");
  assert.equal(parseEntryPoint("home_banner"), "home_banner");
  assert.equal(parseEntryPoint("header_menu"), "header_menu");
  assert.equal(parseEntryPoint("evil<script>"), null);
  assert.equal(parseEntryPoint(undefined), null);
});

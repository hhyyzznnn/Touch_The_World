import assert from "node:assert/strict";
import test from "node:test";
import { inquirySchema } from "@/lib/inquiry-schema";

const baseInquiryInput = {
  schoolName: "서울초등학교",
  contact: "홍길동",
  expectedDate: "",
  participantCount: "",
  purpose: "",
  hasInstructor: "",
  preferredTransport: "",
  mealPreference: "",
  specialRequests: "",
  estimatedBudget: "",
  message: "",
};

test("문의 스키마는 phone/email 둘 다 없으면 실패한다", () => {
  const result = inquirySchema.safeParse({
    ...baseInquiryInput,
    phone: "",
    email: "",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues[0]?.path[0], "phone");
  }
});

test("문의 스키마는 email만 있어도 통과하고 숫자 필드를 변환한다", () => {
  const result = inquirySchema.safeParse({
    ...baseInquiryInput,
    email: "teacher@school.kr",
    phone: "",
    participantCount: "120",
    estimatedBudget: "3500000",
    hasInstructor: "true",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.participantCount, 120);
    assert.equal(result.data.estimatedBudget, 3500000);
    assert.equal(result.data.hasInstructor, true);
  }
});

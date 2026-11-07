import assert from "node:assert/strict";
import test from "node:test";
import { audiencesFromContent, getAudiences, isAudienceKey } from "@/lib/news-audience";

test("해시태그로 대상을 정하고 #교사는 교직원으로 본다", () => {
  assert.deepEqual(getAudiences({ hashtags: ["#일본", "#고등", "#특성화고"] }), ["고등", "특성화고"]);
  assert.deepEqual(getAudiences({ hashtags: ["#해외", "#교사"] }), ["교직원"]);
  assert.deepEqual(getAudiences({ hashtags: ["#인천", "#학생"] }), []);
});

test("본문에 여러 학교급을 함께 대상으로 적은 글은 모든 해당 학교급에 포함된다", () => {
  for (const text of [
    "초·중·고 학교단체 연계로 수련활동을 설계합니다",
    "초중고 수학여행",
    "추천 대상: 초·중고 글로벌 인재양성",
    "초·중·고등학생을 위한 2박 3일",
    "추천 대상: 초등학교, 중학교, 고등학교, 학생자치회",
  ]) {
    assert.deepEqual(audiencesFromContent(text), ["초등", "중등", "고등"], text);
  }
  assert.deepEqual(audiencesFromContent("STEP 02 현장 교류: 중·고등학교 공동수업"), ["중등", "고등"]);
  assert.deepEqual(getAudiences({ hashtags: ["#일본", "#중등", "#고등"], content: "초·중·고 수학여행" }), ["초등", "중등", "고등"]);
});

test("학교급 하나가 지나가듯 언급된 경우는 대상으로 보지 않는다", () => {
  assert.deepEqual(audiencesFromContent("현지 고등학교 자매교 교류"), []);
  assert.deepEqual(audiencesFromContent("초등학생(4학년 이상) 참가 가능"), []);
  assert.deepEqual(audiencesFromContent("일본·중국 칭다오 연수"), []);
  assert.deepEqual(audiencesFromContent("초·중국어 회화"), []);
  // 학교급 바로 뒤에 선생님을 뜻하는 말이 오면 학생 대상이 아니다
  assert.deepEqual(audiencesFromContent("| 연수 대상 | 초·중·고 교원 및 교직원, 교육행정 담당자 |"), []);
  assert.deepEqual(audiencesFromContent("중·고등학교 선생님을 위한 연수"), []);
});

test("주소의 대상 값은 정해진 다섯 가지만 받는다", () => {
  assert.equal(isAudienceKey("초등"), true);
  assert.equal(isAudienceKey("학생"), false);
  assert.equal(isAudienceKey(undefined), false);
});

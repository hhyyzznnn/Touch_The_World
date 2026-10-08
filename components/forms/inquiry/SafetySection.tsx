import { useFormContext } from "react-hook-form";
import type { InquiryFormData } from "@/lib/inquiry-schema";
import { SectionHeader, formatCurrency, inputClass, onlyDigits, sectionClass, selectClass } from "./shared";

/** 6. 안전·행정 및 기타 */
export function SafetySection() {
  const { register, setValue } = useFormContext<InquiryFormData>();

  return (
    <div className={sectionClass}>
      <SectionHeader num={6} title="안전·행정 및 기타" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="insurance" className="block text-sm font-medium mb-2">
            보험 요구사항
          </label>
          <select id="insurance" {...register("insurance")} className={selectClass}>
            <option value="">선택해주세요</option>
            {["여행자보험 포함 요청", "학교 단체보험 별도 가입", "여행사 기본보험만", "미정"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">안전 요원 필요 여부</label>
          <div className="flex gap-6 mt-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="true"
                {...register("safetyStaff")}
                className="accent-brand-green-primary"
              />
              필요
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="false"
                {...register("safetyStaff")}
                className="accent-brand-green-primary"
              />
              불필요
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium mb-2">
          특별 지원 필요 학생
        </label>
        <textarea
          id="specialRequests"
          {...register("specialRequests")}
          rows={2}
          className={inputClass}
          placeholder="예: 휠체어 이용 1명, 당뇨 관리 2명, 의료진 동행 필요"
        />
      </div>

      <div>
        <label htmlFor="rainPlan" className="block text-sm font-medium mb-2">
          우천 대비 계획
        </label>
        <input
          id="rainPlan"
          {...register("rainPlan")}
          className={inputClass}
          placeholder="예: 실내 대체 프로그램 준비 원함, 우천 시 일정 변경 유연하게"
        />
      </div>

      <div>
        <label htmlFor="estimatedBudget" className="block text-sm font-medium mb-2">
          예상 예산 (원)
        </label>
        <input
          id="estimatedBudget"
          type="text"
          inputMode="numeric"
          {...register("estimatedBudget", {
            // 임시저장에서 복구된 값은 숫자로 들어온다 — 문자열만 받으면 복구 후 제출 시 예산이 빠진다.
            setValueAs: (value) =>
              typeof value === "number"
                ? value
                : typeof value === "string" && value
                  ? parseInt(onlyDigits(value), 10)
                  : undefined,
            onChange: (event) => {
              setValue(
                "estimatedBudget",
                formatCurrency(event.target.value) as unknown as number,
                { shouldDirty: true, shouldValidate: true }
              );
            },
          })}
          className={inputClass}
          placeholder="예: 5,000,000"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          기타 문의 내용
        </label>
        <textarea
          id="message"
          {...register("message")}
          rows={4}
          className={inputClass}
          placeholder="추가로 전달하고 싶은 내용을 자유롭게 입력해주세요"
        />
      </div>
    </div>
  );
}

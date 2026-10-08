import { useFormContext } from "react-hook-form";
import type { InquiryFormData } from "@/lib/inquiry-schema";
import { SectionHeader, inputClass, sectionClass, selectClass } from "./shared";

/** 4. 숙박 및 식사 */
export function LodgingSection() {
  const { register } = useFormContext<InquiryFormData>();

  return (
    <div className={sectionClass}>
      <SectionHeader num={4} title="숙박 및 식사" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="accommodationType" className="block text-sm font-medium mb-2">
            숙박 형태
          </label>
          <select id="accommodationType" {...register("accommodationType")} className={selectClass}>
            <option value="">선택해주세요</option>
            {["콘도/리조트", "호텔", "펜션", "청소년수련원", "학교 기숙사", "게스트하우스", "기타"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="roomAssignment" className="block text-sm font-medium mb-2">
            객실 배정 방식
          </label>
          <input
            id="roomAssignment"
            {...register("roomAssignment")}
            className={inputClass}
            placeholder="예: 남녀 분리, 4인 1실, 담임 배정 필요"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mealPreference" className="block text-sm font-medium mb-2">
            식사 취향
          </label>
          <input
            id="mealPreference"
            {...register("mealPreference")}
            className={inputClass}
            placeholder="예: 뷔페 선호, 한식 위주, 지역 향토 음식"
          />
        </div>
        <div>
          <label htmlFor="specialDiet" className="block text-sm font-medium mb-2">
            특이 식단 (알러지 등)
          </label>
          <input
            id="specialDiet"
            {...register("specialDiet")}
            className={inputClass}
            placeholder="예: 견과류 알러지 2명, 채식주의 1명"
          />
        </div>
      </div>
    </div>
  );
}

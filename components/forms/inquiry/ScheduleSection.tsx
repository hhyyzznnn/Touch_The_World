import { useFormContext } from "react-hook-form";
import type { InquiryFormData } from "@/lib/inquiry-schema";
import { SectionHeader, inputClass, sectionClass, selectClass } from "./shared";

/** 2. 일정 및 인원 */
export function ScheduleSection() {
  const { register } = useFormContext<InquiryFormData>();

  return (
    <div className={sectionClass}>
      <SectionHeader num={2} title="일정 및 인원" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="departureDate" className="block text-sm font-medium mb-2">
            출발일
          </label>
          <input
            id="departureDate"
            type="date"
            {...register("departureDate")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium mb-2">
            도착일
          </label>
          <input
            id="returnDate"
            type="date"
            {...register("returnDate")}
            className={inputClass}
          />
        </div>
      </div>
      <p className="text-xs text-text-gray">
        일정이 아직 확정되지 않았거나 기간이 유동적이라면 비워두고 하단 &apos;기타 문의 내용&apos;에 적어주세요.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="participantCount" className="block text-sm font-medium mb-2">
            학생 수 (명)
          </label>
          <input
            id="participantCount"
            type="text"
            inputMode="numeric"
            {...register("participantCount")}
            className={inputClass}
            placeholder="예: 120"
          />
        </div>
        <div>
          <label htmlFor="instructorCount" className="block text-sm font-medium mb-2">
            인솔 교사 수 (명)
          </label>
          <input
            id="instructorCount"
            type="text"
            inputMode="numeric"
            {...register("instructorCount")}
            className={inputClass}
            placeholder="예: 6"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="schoolLevel" className="block text-sm font-medium mb-2">
            학교급
          </label>
          <select id="schoolLevel" {...register("schoolLevel")} className={selectClass}>
            <option value="">선택해주세요</option>
            {["초등학교", "중학교", "고등학교", "특성화고", "대학교/기관"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="targetGrade" className="block text-sm font-medium mb-2">
            대상 학년
          </label>
          <input
            id="targetGrade"
            {...register("targetGrade")}
            className={inputClass}
            placeholder="예: 2학년 전체, 1~3학년"
          />
        </div>
      </div>
    </div>
  );
}

import { useFormContext } from "react-hook-form";
import type { InquiryFormData } from "@/lib/inquiry-schema";
import { SectionHeader, inputClass, sectionClass } from "./shared";

/** 5. 교육 및 프로그램 */
export function ProgramSection() {
  const { register } = useFormContext<InquiryFormData>();

  return (
    <div className={sectionClass}>
      <SectionHeader num={5} title="교육 및 프로그램" />

      <div>
        <label htmlFor="requiredSites" className="block text-sm font-medium mb-2">
          필수 방문지
        </label>
        <input
          id="requiredSites"
          {...register("requiredSites")}
          className={inputClass}
          placeholder="예: 독립기념관, 국립공원, 특정 기업 견학"
        />
      </div>

      <div>
        <label htmlFor="experiencePrograms" className="block text-sm font-medium mb-2">
          희망 체험 프로그램
        </label>
        <textarea
          id="experiencePrograms"
          {...register("experiencePrograms")}
          rows={2}
          className={inputClass}
          placeholder="예: 도자기 만들기, 래프팅, 농촌 체험, 사찰 템플스테이"
        />
      </div>

      <div>
        <label htmlFor="ownEvents" className="block text-sm font-medium mb-2">
          자체 행사 여부/내용
        </label>
        <input
          id="ownEvents"
          {...register("ownEvents")}
          className={inputClass}
          placeholder="예: 레크레이션 자체 진행, 시상식 포함, 장기자랑 준비"
        />
      </div>

      <div>
        <label htmlFor="facilityRequirements" className="block text-sm font-medium mb-2">
          시설 요구사항
        </label>
        <input
          id="facilityRequirements"
          {...register("facilityRequirements")}
          className={inputClass}
          placeholder="예: 강당/회의실 필요, 체육시설 포함, 수영장 원함"
        />
      </div>

      <div>
        <label htmlFor="agentService" className="block text-sm font-medium mb-2">
          섭외 대행 필요 항목
        </label>
        <input
          id="agentService"
          {...register("agentService")}
          className={inputClass}
          placeholder="예: 강연자 섭외, 사진작가 동행, 공연단 섭외"
        />
      </div>
    </div>
  );
}

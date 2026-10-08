import { useFormContext } from "react-hook-form";
import type { InquiryFormData } from "@/lib/inquiry-schema";
import { SectionHeader, inputClass, sectionClass, selectClass } from "./shared";

/** 3. 여행 형태 및 선호도 */
export function TravelSection() {
  const { register } = useFormContext<InquiryFormData>();

  return (
    <div className={sectionClass}>
      <SectionHeader num={3} title="여행 형태 및 선호도" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="accommodation" className="block text-sm font-medium mb-2">
            숙박 여부
          </label>
          <select id="accommodation" {...register("accommodation")} className={selectClass}>
            <option value="">선택해주세요</option>
            {["비숙박 (당일)", "1박 2일", "2박 3일", "3박 4일 이상"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium mb-2">
            여행 지역
          </label>
          <select id="destination" {...register("destination")} className={selectClass}>
            <option value="">선택해주세요</option>
            <optgroup label="국내">
              {["서울/경기", "인천", "강원", "충청", "전라", "경상", "제주"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </optgroup>
            <optgroup label="해외">
              {["일본", "동남아시아", "기타 해외"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="purpose" className="block text-sm font-medium mb-2">
          여행 목적/성격
        </label>
        <input
          id="purpose"
          {...register("purpose")}
          className={inputClass}
          placeholder="예: 역사 탐방, 과학 체험, 진로 탐색, 팀빌딩"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">주 이동수단</label>
          <div className="grid grid-cols-2 gap-y-2">
            {["전세버스", "KTX", "항공", "기타"].map((t) => (
              <label key={t} className="flex items-center gap-2 py-0.5">
                <input
                  type="radio"
                  value={t}
                  {...register("preferredTransport")}
                  className="accent-brand-green-primary"
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">인솔자 필요 여부</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="true"
                {...register("hasInstructor")}
                className="accent-brand-green-primary"
              />
              필요
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="false"
                {...register("hasInstructor")}
                className="accent-brand-green-primary"
              />
              불필요
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="localTransport" className="block text-sm font-medium mb-2">
          현지 교통 수단
        </label>
        <input
          id="localTransport"
          {...register("localTransport")}
          className={inputClass}
          placeholder="예: 관광버스 포함, 도보 위주, 대중교통 활용"
        />
      </div>
    </div>
  );
}

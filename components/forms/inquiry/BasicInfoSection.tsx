import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { InquiryFormData } from "@/lib/inquiry-schema";
import { useSchoolAutocomplete } from "./useSchoolAutocomplete";
import { SectionHeader, formatPhoneNumber, inputClass, sectionClass, selectClass, type InquiryMode } from "./shared";

/** 1. 기본 정보 — 빠른 문의에서는 여행 지역·문의 내용까지 여기서 받는다 */
export function BasicInfoSection({ mode }: { mode: InquiryMode }) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<InquiryFormData>();
  const autocomplete = useSchoolAutocomplete();
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const [dropdownAbove, setDropdownAbove] = useState(false);

  const handleSchoolFocus = () => {
    if (autocomplete.suggestions.length > 0) {
      const rect = schoolInputRef.current?.getBoundingClientRect();
      if (rect) setDropdownAbove(window.innerHeight - rect.bottom < 260);
      autocomplete.setOpen(true);
    }
  };

  return (
    <div className={sectionClass}>
      <SectionHeader num={1} title="기본 정보" />

      {/* 학교명 */}
      <div className="relative">
        <label htmlFor="schoolName" className="block text-sm font-medium mb-2">
          학교명 <span className="text-red-500">*</span>
        </label>
        <input
          id="schoolName"
          {...(() => {
            const { ref, ...rest } = register("schoolName");
            return {
              ...rest,
              ref: (el: HTMLInputElement | null) => {
                ref(el);
                (schoolInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
              },
            };
          })()}
          className={inputClass}
          placeholder="예: 서울중학교"
          autoComplete="off"
          onChange={(e) => {
            register("schoolName").onChange(e);
            autocomplete.search(e.target.value);
          }}
          onBlur={() => setTimeout(() => autocomplete.setOpen(false), 150)}
          onFocus={handleSchoolFocus}
        />
        {autocomplete.open && (
          <ul className={`absolute z-50 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto ${dropdownAbove ? "bottom-full mb-1" : "mt-1"}`}>
            {autocomplete.suggestions.map((s) => (
              <li
                key={`${s.name}-${s.level}`}
                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                onMouseDown={() => {
                  setValue("schoolName", s.name, { shouldValidate: true });
                  if (s.level) setValue("schoolLevel", s.level, { shouldValidate: true });
                  if (s.region) setValue("destination", s.region, { shouldValidate: true });
                  autocomplete.setOpen(false);
                }}
              >
                <span className="text-sm font-medium text-text-dark">{s.name}</span>
                <span className="ml-2 text-xs text-text-gray">{s.level}{s.region ? ` · ${s.region}` : ""}</span>
              </li>
            ))}
          </ul>
        )}
        {errors.schoolName && (
          <p className="text-red-500 text-sm mt-1">{errors.schoolName.message}</p>
        )}
      </div>

      {/* 담당자명 + 직책 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact" className="block text-sm font-medium mb-2">
            담당자명 <span className="text-red-500">*</span>
          </label>
          <input
            id="contact"
            {...register("contact")}
            className={inputClass}
            placeholder="예: 홍길동"
          />
          {errors.contact && (
            <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="position" className="block text-sm font-medium mb-2">
            직책
          </label>
          <input
            id="position"
            {...register("position")}
            className={inputClass}
            placeholder="예: 교무부장, 담임교사"
          />
        </div>
      </div>

      {/* 연락처 + 이메일 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            연락처 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            inputMode="numeric"
            autoComplete="tel"
            {...register("phone", {
              onChange: (event) => {
                setValue("phone", formatPhoneNumber(event.target.value), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              },
            })}
            className={inputClass}
            placeholder="예: 010-1234-5678"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={inputClass}
            placeholder="example@school.kr"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* 학교 주소 */}
      {mode === "detailed" && (
        <div>
          <label htmlFor="schoolAddress" className="block text-sm font-medium mb-2">
            학교 주소
          </label>
          <input
            id="schoolAddress"
            {...register("schoolAddress")}
            className={inputClass}
            placeholder="예: 서울특별시 강남구 학교로 123"
          />
        </div>
      )}

      {/* 빠른 문의: 메시지 바로 노출 */}
      {mode === "quick" && (
        <>
          <div>
            <label htmlFor="destination-quick" className="block text-sm font-medium mb-2">
              여행 지역
            </label>
            <select id="destination-quick" {...register("destination")} className={selectClass}>
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
          <div>
            <label htmlFor="message-quick" className="block text-sm font-medium mb-2">
              문의 내용
            </label>
            <textarea
              id="message-quick"
              {...register("message")}
              rows={5}
              className={inputClass}
              placeholder="궁금한 점이나 원하는 프로그램을 간단히 적어주세요"
            />
          </div>
        </>
      )}
    </div>
  );
}

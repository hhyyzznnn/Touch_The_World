export const INQUIRY_STATUS_VALUES = [
  "pending",
  "reviewing",
  "quoted",
  "completed",
] as const;

export type InquiryStatusValue = (typeof INQUIRY_STATUS_VALUES)[number];

export function isValidInquiryStatus(value: string): value is InquiryStatusValue {
  return INQUIRY_STATUS_VALUES.includes(value as InquiryStatusValue);
}

export function getInquiryStatusMeta(status: string): {
  label: string;
  badgeClassName: string;
  userGuide: string;
} {
  switch (status) {
    case "reviewing":
      return {
        label: "검토 중",
        badgeClassName: "bg-blue-100 text-blue-800",
        userGuide: "담당자가 요청 내용을 검토 중입니다.",
      };
    case "quoted":
      return {
        label: "견적 발송",
        badgeClassName: "bg-violet-100 text-violet-800",
        userGuide: "견적 안내가 발송되었습니다. 확인 후 회신 부탁드립니다.",
      };
    case "completed":
      return {
        label: "완료",
        badgeClassName: "bg-green-100 text-green-800",
        userGuide: "문의 처리가 완료되었습니다.",
      };
    case "pending":
    default:
      return {
        label: "접수됨",
        badgeClassName: "bg-amber-100 text-amber-800",
        userGuide: "접수 완료. 영업일 기준 24시간 내에 연락드립니다.",
      };
  }
}

export function formatInquiryNumber(id: string): string {
  return `INQ-${id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()}`;
}

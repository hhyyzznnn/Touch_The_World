export type InquiryMode = "quick" | "detailed";

export const inputClass =
  "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary";
export const selectClass =
  "w-full px-4 py-3 h-11 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary";
export const sectionClass = "space-y-5";

export function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="text-base font-semibold text-brand-green-primary border-b border-brand-green-primary/20 pb-2 mb-1">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-green-primary text-white text-xs font-bold mr-2">
        {num}
      </span>
      {title}
    </div>
  );
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneNumber(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function formatCurrency(value: string) {
  const digits = onlyDigits(value);
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

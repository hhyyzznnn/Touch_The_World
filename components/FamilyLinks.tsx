import Image from "next/image";
import { ExternalLink } from "lucide-react";

/**
 * 터치더월드와 제휴사를 "무엇이 필요할 때 어디로"로 한 묶음처럼 보여주는 연결 메뉴.
 * 제휴사를 단순 외부 링크가 아니라 역할을 나눈 형제 사이트처럼 읽히게 하는 것이 목적이다.
 */
const FAMILY = [
  { key: "ttw", need: "교육여행은", brand: "터치더월드", href: "/", current: true },
  { key: "aso", need: "일본유학은", brand: "아소전문학교", href: "https://www.asojuku.co.kr", current: false },
  { key: "hanatour", need: "교직원 여행은", brand: "하나투어", href: "https://ttw.hanatour.com", current: false },
] as const;

type FamilyItem = (typeof FAMILY)[number];

const linkProps = (item: FamilyItem) =>
  item.current
    ? { href: item.href, "aria-current": "page" as const }
    : { href: item.href, target: "_blank", rel: "noopener noreferrer" };

function FamilyMark({ item }: { item: FamilyItem }) {
  if (item.key === "hanatour") {
    return (
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white p-1">
        <Image src="/logos/hanatour-icon.png" alt="" width={256} height={256} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold tracking-wide text-white ${
        item.key === "aso" ? "bg-[#C9A227]" : "bg-brand-green-primary"
      }`}
    >
      {item.key === "aso" ? "ASO" : "TTW"}
    </span>
  );
}

/** 메인 첫 화면 AI 입력창 아래 3칸 */
export function FamilyCards() {
  return (
    <nav aria-label="터치더월드와 제휴사" className="grid grid-cols-3 gap-2">
      {FAMILY.map((item) => (
        <a
          key={item.key}
          {...linkProps(item)}
          className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors sm:px-4 ${
            item.current
              ? "border-brand-green-primary/40 bg-brand-green-primary/5"
              : "border-gray-200 bg-white/80 hover:border-brand-green-primary/40 hover:bg-white"
          }`}
        >
          <span className="hidden sm:flex">
            <FamilyMark item={item} />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[11px] text-text-gray sm:text-xs">{item.need}</span>
            <span className={`block truncate text-[13px] font-bold sm:text-[15px] ${item.current ? "text-brand-green-primary" : "text-text-dark"}`}>
              {item.brand}
            </span>
          </span>
          {!item.current && <ExternalLink className="hidden h-3.5 w-3.5 flex-shrink-0 text-text-gray sm:block" aria-hidden />}
        </a>
      ))}
    </nav>
  );
}

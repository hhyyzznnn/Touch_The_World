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

/** 헤더 위 띠 — 모든 페이지 최상단에 표시되고, 스크롤하면 헤더만 남는다 */
export function FamilyBar() {
  return (
    <nav aria-label="터치더월드와 제휴사" className="bg-[#1B4332] text-white print:hidden">
      <ul className="container mx-auto grid grid-cols-3 px-2 sm:flex sm:px-6 md:px-8">
        {FAMILY.map((item) => (
          <li key={item.key} className="sm:border-r sm:border-white/15 sm:first:border-l">
            <a
              {...linkProps(item)}
              className={`flex h-11 flex-col items-center justify-center gap-0 px-1 text-center leading-tight transition-colors sm:h-9 sm:flex-row sm:gap-1.5 sm:px-5 ${
                item.current ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-[10px] sm:text-xs">{item.need}</span>
              <span className="flex items-center gap-1 text-xs font-bold sm:text-[13px]">
                {item.brand}
                {!item.current && <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

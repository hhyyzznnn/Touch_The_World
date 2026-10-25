import Image from "next/image";
import { ExternalLink } from "lucide-react";

/**
 * 터치더월드와 제휴사를 "무엇이 필요할 때 어디로"로 한 묶음처럼 보여주는 연결 메뉴.
 * 제휴사를 단순 외부 링크가 아니라 역할을 나눈 형제 사이트처럼 읽히게 하는 것이 목적이다.
 * 한 칸에 제휴처가 여럿이면(일본유학: 전문학교·고등학교) 칸 안에 각각 링크로 나열한다.
 */
const FAMILY = [
  { key: "ttw", need: "교육여행은", current: true, brands: [{ name: "터치더월드", href: "/" }] },
  {
    key: "japan",
    need: "일본유학은",
    current: false,
    brands: [
      { name: "아소전문학교", href: "https://www.asojuku.co.kr" },
      { name: "야나기가우라고", href: "https://www.yanagigaura.co.kr" },
    ],
  },
  { key: "hanatour", need: "교직원 여행은", current: false, brands: [{ name: "하나투어", href: "https://ttw.hanatour.com" }] },
] as const;

type FamilyItem = (typeof FAMILY)[number];

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

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
        item.key === "japan" ? "bg-[#C9A227]" : "bg-brand-green-primary"
      }`}
    >
      {item.key === "japan" ? "JP" : "TTW"}
    </span>
  );
}

const cardClass = (current: boolean) =>
  `flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-colors sm:px-4 ${
    current
      ? "border-brand-green-primary/40 bg-brand-green-primary/5"
      : "border-gray-200 bg-white/80 hover:border-brand-green-primary/40 hover:bg-white"
  }`;

/** 메인 첫 화면 AI 입력창 아래 3칸 */
export function FamilyCards() {
  return (
    <nav aria-label="터치더월드와 제휴사" className="grid grid-cols-3 gap-2">
      {FAMILY.map((item) => {
        const label = <span className="block text-[11px] text-text-gray sm:text-xs">{item.need}</span>;
        const mark = (
          <span className="hidden sm:flex">
            <FamilyMark item={item} />
          </span>
        );

        // 제휴처가 하나면 칸 전체가 링크
        if (item.brands.length === 1) {
          const brand = item.brands[0];
          return (
            <a
              key={item.key}
              href={brand.href}
              {...(item.current ? { "aria-current": "page" as const } : external)}
              className={cardClass(item.current)}
            >
              {mark}
              <span className="min-w-0 flex-1 leading-tight">
                {label}
                <span className={`block truncate text-[13px] font-bold sm:text-[15px] ${item.current ? "text-brand-green-primary" : "text-text-dark"}`}>
                  {brand.name}
                </span>
              </span>
              {!item.current && <ExternalLink className="hidden h-3.5 w-3.5 flex-shrink-0 text-text-gray sm:block" aria-hidden />}
            </a>
          );
        }

        // 여럿이면 칸 안에 제휴처별 링크를 한 줄씩
        return (
          <div key={item.key} className={cardClass(false)}>
            {mark}
            <span className="min-w-0 flex-1 leading-tight">
              {label}
              {item.brands.map((brand) => (
                <a
                  key={brand.href}
                  href={brand.href}
                  {...external}
                  className="flex items-center gap-1 text-[13px] font-bold text-text-dark hover:text-brand-green-primary hover:underline sm:text-[15px]"
                >
                  <span className="truncate">{brand.name}</span>
                  <ExternalLink className="hidden h-3 w-3 flex-shrink-0 text-text-gray sm:block" aria-hidden />
                </a>
              ))}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

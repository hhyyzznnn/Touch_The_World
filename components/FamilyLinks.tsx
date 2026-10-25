import Image from "next/image";
import { ExternalLink } from "lucide-react";

/**
 * 터치더월드와 제휴사를 "무엇이 필요할 때 어디로"로 한 묶음처럼 보여주는 연결 메뉴.
 * 제휴사를 단순 외부 링크가 아니라 역할을 나눈 형제 사이트처럼 읽히게 하는 것이 목적이다.
 * 한 칸에 제휴처가 여럿이면(일본유학: 전문학교·고등학교) 칸 안에 각각 독립된 버튼으로 나눈다.
 */
type Logo = { src: string; alt: string } | { badge: string; className: string };

const FAMILY: {
  key: string;
  need: string;
  current: boolean;
  brands: { name: string; href: string; sub?: string; logo: Logo }[];
}[] = [
  {
    key: "ttw",
    need: "교육여행은",
    current: true,
    brands: [{ name: "터치더월드", href: "/", logo: { src: "/logos/partners/ttw-mark.png", alt: "터치더월드" } }],
  },
  {
    key: "japan",
    need: "일본유학은",
    current: false,
    brands: [
      // 아소 한국사무소 사이트의 로고가 이미지가 아닌 금색 "ASO" 글자 상자라 같은 모양으로 맞춘다
      { name: "아소전문학교", href: "https://www.asojuku.co.kr", sub: "전문학교 진학", logo: { badge: "ASO", className: "bg-[#C9A227] text-white" } },
      { name: "야나기가우라고", href: "https://www.yanagigaura.co.kr", sub: "고등학교 유학", logo: { src: "/logos/partners/yanagigaura-emblem.png", alt: "야나기가우라 고등학교 교표" } },
    ],
  },
  {
    key: "hanatour",
    need: "교직원 여행은",
    current: false,
    brands: [{ name: "하나투어", href: "https://ttw.hanatour.com", logo: { src: "/logos/hanatour-icon.png", alt: "하나투어" } }],
  },
];

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function LogoMark({ logo }: { logo: Logo }) {
  if ("badge" in logo) {
    return (
      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold tracking-wide ${logo.className}`}>
        {logo.badge}
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-gray-100 bg-white p-1">
      <Image src={logo.src} alt={logo.alt} width={64} height={64} className="h-full w-full object-contain" />
    </span>
  );
}

/**
 * 메인 첫 화면 AI 입력창 아래 제휴 칸.
 * PC: [터치더월드] [일본유학 — 두 학교 버튼] [하나투어] (가운데 칸 두 배 폭)
 * 모바일: 윗줄 터치더월드·하나투어, 아랫줄 일본유학 전체 폭
 */
export function FamilyCards() {
  return (
    <nav aria-label="터치더월드와 제휴사" className="grid grid-cols-2 gap-2 text-left sm:grid-cols-[1fr_2fr_1fr]">
      {FAMILY.map((item) => {
        // 제휴처가 하나면 칸 전체가 링크
        if (item.brands.length === 1) {
          const brand = item.brands[0];
          return (
            <a
              key={item.key}
              href={brand.href}
              {...(item.current ? { "aria-current": "page" as const } : external)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 transition-colors sm:px-4 ${
                item.current
                  ? "border-brand-green-primary/40 bg-brand-green-primary/5"
                  : "border-gray-200 bg-white/80 hover:border-brand-green-primary/40 hover:bg-white"
              }`}
            >
              <LogoMark logo={brand.logo} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[11px] text-text-gray sm:text-xs">{item.need}</span>
                <span className={`block truncate text-[14px] font-bold sm:text-[15px] ${item.current ? "text-brand-green-primary" : "text-text-dark"}`}>
                  {brand.name}
                </span>
              </span>
              {!item.current && <ExternalLink className="hidden h-3.5 w-3.5 flex-shrink-0 text-text-gray sm:block" aria-hidden />}
            </a>
          );
        }

        // 여럿이면 제목은 칸 위쪽에 작게, 제휴처마다 독립된 버튼
        return (
          <div
            key={item.key}
            className="order-last col-span-2 rounded-xl border border-gray-200 bg-white/80 px-2 pb-2 pt-1.5 sm:order-none sm:col-span-1"
          >
            <p className="px-1.5 pb-1.5 text-[11px] text-text-gray sm:text-xs">{item.need}</p>
            <div className="grid grid-cols-2 gap-2">
              {item.brands.map((brand) => (
                <a
                  key={brand.href}
                  href={brand.href}
                  {...external}
                  className="group flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-brand-green-primary/40"
                >
                  <LogoMark logo={brand.logo} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[10px] text-text-gray sm:text-[11px]">{brand.sub}</span>
                    <span className="block truncate text-[13px] font-bold text-text-dark group-hover:text-brand-green-primary sm:text-[14px]">
                      {brand.name}
                    </span>
                  </span>
                  <ExternalLink className="hidden h-3 w-3 flex-shrink-0 text-text-gray sm:block" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

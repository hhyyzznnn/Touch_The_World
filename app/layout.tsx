import type { Metadata } from "next";
import { Noto_Serif_KR, Bona_Nova_SC } from "next/font/google";
// 한 파일(2MB)을 통째로 받던 것을 글자 범위별로 나눈 버전으로 — 화면에 쓰인 글자 조각만 내려받는다
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { DynamicFloatingChat } from "@/components/DynamicFloatingChat";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { KakaoScript } from "@/components/KakaoScript";
import { getSiteUrl } from "@/lib/site-url";
import { COMPANY_INFO } from "@/lib/constants";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { ToastProvider } from "@/components/ui/toast";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { AttributionCapture } from "@/components/tracking/AttributionCapture";

const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const bonaNovaSC = Bona_Nova_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bona-nova",
  display: "swap",
});

const siteUrl = getSiteUrl();
const naverSiteVerification =
  process.env.NAVER_SITE_VERIFICATION || "7d713c24d0a2bc5a9a32549a03dcd7bd86348d87";
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION;
const socialLinks = [COMPANY_INFO.instagram, COMPANY_INFO.facebook].filter(Boolean) as string[];
const SEO_TITLE = "터치더월드 | 교육여행·체험학습·AI 교육 프로그램";
const SEO_DESCRIPTION =
  "1996년부터 학교·지자체 대상 교육여행과 체험학습을 기획·운영해온 전문 기업입니다. 안전 중심 운영과 맞춤형 설계로 현장 완성도를 높입니다.";
const SEO_KEYWORDS = mergeKeywords(BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/ttw_icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/ttw_icon.png",
  },
  verification: {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    other: {
      ...(naverSiteVerification
        ? { "naver-site-verification": naverSiteVerification }
        : {}),
    },
  },
  openGraph: {
    url: siteUrl,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    siteName: "터치더월드",
    locale: "ko_KR",
    type: "website",
    images: [
      { url: "/images/og_image2.png", width: 1376, height: 768, alt: "터치더월드 | 교육여행 전문" },
      { url: "/images/og_image_1x1.png", width: 1024, height: 1024, alt: "터치더월드 | 교육여행 전문" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: ["/images/og_image2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* next/image의 fill 이미지는 부모의 relative(Tailwind CSS)에 기대는데, 배포 직후 등 스타일 파일이 늦거나
            못 받아지면 부모 기준이 사라져 이미지가 화면 전체를 덮었다(새로고침하면 정상). 스타일 파일 없이도
            부모 칸 안에 머물도록 우선순위 0(:where)으로 기본값만 깔아 둔다 — 스타일 파일이 오면 그대로 덮어쓴다. */}
        <style
          dangerouslySetInnerHTML={{
            __html: ':where(:has(> img[data-nimg="fill"])){position:relative;overflow:hidden}',
          }}
        />
        {/* 스타일 파일을 못 받으면 한 번만 자동 새로고침 (30초 안에 반복되면 멈춤) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "addEventListener('error',function(e){var t=e.target;if(!t||t.tagName!=='LINK'||t.rel!=='stylesheet')return;try{var k='ttw_css_reload',l=+sessionStorage.getItem(k)||0;if(Date.now()-l<30000)return;sessionStorage.setItem(k,String(Date.now()))}catch(_){}location.reload()},true);",
          }}
        />
        {/* 네이버 검색 최적화를 위한 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Touch The World",
              alternateName: "터치더월드",
              url: siteUrl,
              logo: `${siteUrl}/ttw_logo.png`,
              description: SEO_DESCRIPTION,
              foundingDate: "1996",
              address: {
                "@type": "PostalAddress",
                addressCountry: "KR",
              },
              sameAs: socialLinks,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Touch The World",
              alternateName: "터치더월드",
              url: siteUrl,
              image: `${siteUrl}/ttw_logo.png`,
              telephone: COMPANY_INFO.phone,
              email: COMPANY_INFO.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: COMPANY_INFO.address,
                addressLocality: "강남구",
                addressRegion: "서울특별시",
                postalCode: "06235",
                addressCountry: "KR",
              },
              areaServed: "KR",
              foundingDate: "1996",
              knowsAbout: mergeKeywords(CORE_TRAVEL_KEYWORDS, B2B_KEYWORDS),
              sameAs: [
                COMPANY_INFO.instagram,
                COMPANY_INFO.facebook,
                COMPANY_INFO.youtube,
                COMPANY_INFO.kakaoChannel,
              ].filter(Boolean),
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Touch The World",
              alternateName: "터치더월드",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <GoogleAnalytics />
      <MicrosoftClarity />
      <body className={`${notoSerif.variable} ${bonaNovaSC.variable} font-sans`} suppressHydrationWarning>
        <ToastProvider>
          <KakaoScript />
          <AttributionCapture />
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <div className="print:hidden"><Header /></div>
          <main className="min-h-screen">{children}</main>
          <div className="print:hidden"><ConditionalFooter /></div>
          <div className="print:hidden"><DynamicFloatingChat /></div>
        </ToastProvider>
      </body>
    </html>
  );
}

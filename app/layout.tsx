import type { Metadata } from "next";
import { Noto_Serif_KR, Bona_Nova_SC } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { DynamicFloatingChat } from "@/components/DynamicFloatingChat";
import { ProgramCompare } from "@/components/programs/ProgramCompare";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { KakaoScript } from "@/components/KakaoScript";
import { getSiteUrl } from "@/lib/site-url";
import { COMPANY_INFO } from "@/lib/constants";
import { B2B_KEYWORDS, BRAND_KEYWORDS, CORE_TRAVEL_KEYWORDS, mergeKeywords } from "@/lib/seo";
import { ToastProvider } from "@/components/ui/toast";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

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
    icon: "/ttw_logo.png",
    apple: "/ttw_logo.png",
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
    images: [{ url: "/images/og_image2.png", width: 1376, height: 768, alt: "터치더월드 | 교육여행 전문" }],
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
        {/* jsDelivr CDN 연결 선점 — Pretendard 폰트 로딩 지연 단축 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
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
      <body className={`${notoSerif.variable} ${bonaNovaSC.variable} font-sans`} suppressHydrationWarning>
        <ToastProvider>
          <KakaoScript />
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <div className="print:hidden"><Header /></div>
          <main className="min-h-screen">{children}</main>
          <div className="print:hidden"><ConditionalFooter /></div>
          <div className="print:hidden"><DynamicFloatingChat /></div>
          <ProgramCompare />
        </ToastProvider>
      </body>
    </html>
  );
}

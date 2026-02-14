import type { Metadata } from "next";
import { Noto_Serif_KR, Bona_Nova_SC } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { ProgramCompare } from "@/components/ProgramCompare";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { KakaoScript } from "@/components/KakaoScript";

const notoSerif = Noto_Serif_KR({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
});

const bonaNovaSC = Bona_Nova_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bona-nova",
});

export const metadata: Metadata = {
  title: "Touch The World - 교육·체험·AI 융합 프로그램 전문 기업",
  description: "1996년 설립된 터치더월드는 28년 이상의 운영 경험으로 안전하고 질 높은 교육 프로그램을 제공합니다. 학생 체험학습, 국내외 탐방, AI 교육 프로그램 등 8개 분야의 전문 프로그램을 운영합니다.",
  icons: {
    icon: "/ttw_logo.png",
    apple: "/ttw_logo.png",
  },
  verification: {
    other: {
      "naver-site-verification": "7d713c24d0a2bc5a9a32549a03dcd7bd86348d87",
    },
  },
  openGraph: {
    title: "Touch The World - 교육·체험·AI 융합 프로그램 전문 기업",
    description: "1996년 설립된 터치더월드는 28년 이상의 운영 경험으로 안전하고 질 높은 교육 프로그램을 제공합니다.",
    images: [
      {
        url: "/ttw_logo.png",
        width: 1200,
        height: 630,
        alt: "Touch The World",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Touch The World - 교육·체험·AI 융합 프로그램 전문 기업",
    description: "1996년 설립된 터치더월드는 28년 이상의 운영 경험으로 안전하고 질 높은 교육 프로그램을 제공합니다.",
    images: ["/ttw_logo.png"],
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
              url: "https://touchtheworld.co.kr",
              logo: "https://touchtheworld.co.kr/ttw_logo.png",
              description: "1996년 설립된 터치더월드는 28년 이상의 운영 경험으로 안전하고 질 높은 교육 프로그램을 제공합니다.",
              foundingDate: "1996",
              address: {
                "@type": "PostalAddress",
                addressCountry: "KR",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={`${notoSerif.variable} ${bonaNovaSC.variable} font-sans`} suppressHydrationWarning>
        <KakaoScript />
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <ConditionalFooter />
        <FloatingChatButton />
        <ProgramCompare />
      </body>
    </html>
  );
}


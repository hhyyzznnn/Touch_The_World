import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://touchtheworld.co.kr";

  return {
    rules: [
      {
        // 모든 검색로봇에 대해 기본 허용
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/login",
          "/register",
          "/profile",
          "/verify-email",
          "/verify-phone",
          "/api/auth/callback", // 리디렉션되는 콜백 페이지 차단
        ],
      },
      {
        // 네이버 검색로봇(Yeti)에 대한 명시적 허용
        userAgent: "Yeti",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/login",
          "/register",
          "/profile",
          "/verify-email",
          "/verify-phone",
          "/api/auth/callback",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


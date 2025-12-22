import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://yourdomain.com";

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
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

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
          "/verify-email",
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
          "/verify-email",
        ],
      },
    ],
    host: baseUrl,
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/rss.xml`],
  };
}

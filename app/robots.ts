import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://yourdomain.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/login",
          "/register",
          "/profile",
          "/verify-email",
          "/search",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


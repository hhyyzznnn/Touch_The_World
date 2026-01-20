import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-static";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://touchtheworld.co.kr";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/achievements`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/documents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/inquiry`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // 동적 페이지: 프로그램
  let programPages: MetadataRoute.Sitemap = [];
  try {
    const programs = await prisma.program.findMany({
      select: { id: true, updatedAt: true },
    });
    programPages = programs.map((program) => ({
      url: `${baseUrl}/programs/${program.id}`,
      lastModified: program.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching programs for sitemap:", error);
  }

  // 동적 페이지: 행사
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const events = await prisma.event.findMany({
      select: { id: true, updatedAt: true },
    });
    eventPages = events.map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: event.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching events for sitemap:", error);
  }

  // 동적 페이지: 학교
  let schoolPages: MetadataRoute.Sitemap = [];
  try {
    const schools = await prisma.school.findMany({
      select: { id: true, updatedAt: true },
    });
    schoolPages = schools.map((school) => ({
      url: `${baseUrl}/school/${school.id}`,
      lastModified: school.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching schools for sitemap:", error);
  }

  return [...staticPages, ...programPages, ...eventPages, ...schoolPages];
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// RFC-822 날짜 형식으로 변환 (네이버 요구사항)
function formatRFC822(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = days[date.getUTCDay()];
  const dayNum = date.getUTCDate().toString().padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");

  return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} +0900`;
}

// URL이 같은 도메인인지 확인하고, 필요시 변환
function ensureSameDomain(url: string | null, baseUrl: string): string | null {
  if (!url) return null;
  
  // 절대 URL인 경우
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    
    // 같은 도메인이면 그대로 반환
    if (urlObj.hostname === baseUrlObj.hostname) {
      return url;
    }
    
    // 외부 도메인이면 null 반환 (네이버 요구사항: 같은 도메인만 허용)
    return null;
  }
  
  // 상대 URL인 경우 baseUrl과 결합
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

export async function GET() {
  // 네이버에 등록된 도메인과 일치해야 함 (www 포함)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://www.touchtheworld.co.kr";

  try {
    // 최근 프로그램 (최대 10개 - 네이버 권장사항: 중요한 콘텐츠만)
    const recentPrograms = await prisma.program.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        summary: true,
        description: true,
        category: true,
        createdAt: true,
        thumbnailUrl: true,
        images: {
          take: 2, // 최대 2개 이미지만 포함 (용량 제한 고려)
          orderBy: { createdAt: "asc" },
          select: {
            url: true,
          },
        },
      },
    });

    // RSS 아이템 생성
    const items: string[] = [];

    // 프로그램 아이템만 포함 (네이버 예제 형식에 맞춤)
    recentPrograms.forEach((program) => {
      const url = `${baseUrl}/programs/${program.id}`;
      const title = program.title;
      
      // 본문 전체 HTML 생성 (네이버 요구사항: 본문 전체 공개)
      const contentParts: string[] = [];
      
      // 썸네일 이미지 추가
      const thumbnailUrl = ensureSameDomain(program.thumbnailUrl, baseUrl);
      if (thumbnailUrl) {
        contentParts.push(`<p><img src="${thumbnailUrl}" alt="${title}" /></p>`);
      }
      
      // 추가 이미지들 (최대 2개)
      program.images.forEach((image) => {
        const imageUrl = ensureSameDomain(image.url, baseUrl);
        if (imageUrl) {
          contentParts.push(`<p><img src="${imageUrl}" alt="${title}" /></p>`);
        }
      });
      
      // 본문 내용
      if (program.summary) {
        contentParts.push(`<p><strong>${program.summary}</strong></p>`);
      }
      if (program.description) {
        // 줄바꿈을 <br>로 변환
        const formattedDescription = program.description.replace(/\n/g, "<br />");
        contentParts.push(`<p>${formattedDescription}</p>`);
      }
      
      const fullContent = contentParts.join("") || program.summary || program.description || "";
      const pubDate = formatRFC822(new Date(program.createdAt));

      // 네이버 공식 예제 형식에 맞춤 (단순한 RSS 2.0)
      items.push(`  <item>
    <title><![CDATA[${title}]]></title>
    <link>${url}</link>
    <description><![CDATA[${fullContent}]]></description>
    <pubDate>${pubDate}</pubDate>
    <guid>${url}</guid>
  </item>`);
    });

    // RSS XML 생성 (네이버 공식 예제 형식)
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Touch The World - 교육·체험·AI 융합 프로그램 전문 기업</title>
    <link>${baseUrl}</link>
    <description>1996년 설립된 터치더월드는 28년 이상의 운영 경험으로 안전하고 질 높은 교육 프로그램을 제공합니다.</description>
${items.join("\n")}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}

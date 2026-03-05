import { prisma } from "./prisma";
import { Resend } from "resend";
import { sendKakaoAlimtalk } from "./kakao-alimtalk";

const PURPOSE_STOPWORDS = new Set([
  "및",
  "그리고",
  "또는",
  "희망",
  "관련",
  "프로그램",
  "체험",
  "여행",
  "교육",
  "수업",
  "학생",
  "학년",
  "우리",
  "학교",
  "진행",
  "가능",
  "문의",
  "원함",
  "원해요",
  "좋아요",
]);

type RecommendationProgram = {
  id: string;
  title: string;
  category: string;
  summary: string | null;
  region: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  rating: number | null;
  reviewCount: number;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  score: number;
  reasons: string[];
};

type PreferenceProfile = {
  topCategories: string[];
  topRegions: string[];
  purposeKeywords: string[];
  avgBudgetPerPerson?: number;
  sourceCounts: {
    consultingLogs: number;
    favorites: number;
  };
};

function normalizeText(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function toNumber(value: bigint | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : undefined;
}

function tokenizePurpose(text?: string | null): string[] {
  if (!text) return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !PURPOSE_STOPWORDS.has(token));
  return Array.from(new Set(cleaned)).slice(0, 8);
}

function rankTop(map: Map<string, number>, limit: number): string[] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

async function buildPreferenceProfile(userId: string): Promise<PreferenceProfile> {
  const [consultingLogs, favoritePrograms] = await Promise.all([
    prisma.consultingLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        category: true,
        region: true,
        purpose: true,
        estimatedBudget: true,
        participantCount: true,
      },
    }),
    prisma.favorite.findMany({
      where: { userId },
      include: {
        program: {
          select: {
            category: true,
            region: true,
            title: true,
            summary: true,
            hashtags: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const categoryCounter = new Map<string, number>();
  const regionCounter = new Map<string, number>();
  const keywordCounter = new Map<string, number>();
  let budgetSum = 0;
  let budgetCount = 0;

  for (const log of consultingLogs) {
    if (log.category) {
      categoryCounter.set(log.category, (categoryCounter.get(log.category) || 0) + 2);
    }
    if (log.region) {
      regionCounter.set(log.region, (regionCounter.get(log.region) || 0) + 2);
    }

    for (const keyword of tokenizePurpose(log.purpose)) {
      keywordCounter.set(keyword, (keywordCounter.get(keyword) || 0) + 2);
    }

    const estimatedBudget = toNumber(log.estimatedBudget);
    if (estimatedBudget && estimatedBudget > 0) {
      const perPerson =
        log.participantCount && log.participantCount > 0
          ? estimatedBudget / log.participantCount
          : estimatedBudget;
      budgetSum += perPerson;
      budgetCount += 1;
    }
  }

  for (const favorite of favoritePrograms) {
    const program = favorite.program;
    if (program.category) {
      categoryCounter.set(program.category, (categoryCounter.get(program.category) || 0) + 1);
    }
    if (program.region) {
      regionCounter.set(program.region, (regionCounter.get(program.region) || 0) + 1);
    }

    const textKeywords = [
      ...tokenizePurpose(program.title),
      ...tokenizePurpose(program.summary),
      ...program.hashtags.map((tag) => tag.replace("#", "").toLowerCase()),
    ];

    for (const keyword of textKeywords) {
      if (!keyword) continue;
      keywordCounter.set(keyword, (keywordCounter.get(keyword) || 0) + 1);
    }
  }

  return {
    topCategories: rankTop(categoryCounter, 3),
    topRegions: rankTop(regionCounter, 3),
    purposeKeywords: rankTop(keywordCounter, 6),
    avgBudgetPerPerson: budgetCount > 0 ? Math.round(budgetSum / budgetCount) : undefined,
    sourceCounts: {
      consultingLogs: consultingLogs.length,
      favorites: favoritePrograms.length,
    },
  };
}

function scoreProgram(
  program: {
    id: string;
    title: string;
    category: string;
    summary: string | null;
    description: string | null;
    region: string | null;
    priceFrom: number | null;
    priceTo: number | null;
    rating: number | null;
    reviewCount: number;
    thumbnailUrl: string | null;
    images: Array<{ url: string }>;
  },
  profile: PreferenceProfile
): RecommendationProgram {
  let score = 0;
  const reasons: string[] = [];

  if (profile.topCategories.includes(program.category)) {
    score += 35;
    reasons.push(`관심 카테고리(${program.category})`);
  }

  const normalizedRegion = normalizeText(program.region);
  const matchedRegion = profile.topRegions.find((region) =>
    normalizedRegion.includes(normalizeText(region))
  );
  if (matchedRegion) {
    score += 25;
    reasons.push(`선호 지역(${matchedRegion})`);
  }

  const searchableText = normalizeText(
    [program.title, program.summary, program.description, program.region].filter(Boolean).join(" ")
  );
  const matchedKeywords = profile.purposeKeywords.filter((keyword) =>
    searchableText.includes(normalizeText(keyword))
  );
  if (matchedKeywords.length > 0) {
    score += Math.min(20, matchedKeywords.length * 5);
    reasons.push(`요구사항 키워드(${matchedKeywords.slice(0, 3).join(", ")})`);
  }

  if (program.rating && program.rating > 0) {
    score += Math.round(program.rating * 2);
  }
  if (program.reviewCount > 0) {
    score += Math.min(10, Math.floor(program.reviewCount / 20));
  }

  if (profile.avgBudgetPerPerson && profile.avgBudgetPerPerson > 0) {
    const budget = profile.avgBudgetPerPerson;
    const inRange =
      (program.priceFrom && program.priceFrom <= budget * 1.3) ||
      (program.priceTo && program.priceTo >= budget * 0.7);
    if (inRange) {
      score += 8;
      reasons.push("예산대 유사");
    }
  }

  if (reasons.length === 0) {
    reasons.push("최근 인기/평점 기준");
  }

  return {
    id: program.id,
    title: program.title,
    category: program.category,
    summary: program.summary,
    region: program.region,
    priceFrom: program.priceFrom,
    priceTo: program.priceTo,
    rating: program.rating,
    reviewCount: program.reviewCount,
    thumbnailUrl: program.thumbnailUrl,
    imageUrl: program.images[0]?.url || null,
    score,
    reasons,
  };
}

function formatRecommendationLines(programs: RecommendationProgram[]): string {
  return programs
    .map((program, index) => {
      const priceText =
        program.priceFrom && program.priceTo
          ? `인원당 ${(program.priceFrom / 10000).toFixed(0)}~${(program.priceTo / 10000).toFixed(0)}만원`
          : program.priceFrom
          ? `인원당 ${(program.priceFrom / 10000).toFixed(0)}만원부터`
          : "가격 문의";
      return `${index + 1}. ${program.title} (${program.region || "지역 미지정"}, ${priceText})`;
    })
    .join("<br/>");
}

export async function getPersonalizedProgramRecommendations(
  userId: string,
  options?: { limit?: number }
): Promise<{ profile: PreferenceProfile; recommendations: RecommendationProgram[] }> {
  const limit = Math.max(1, Math.min(10, options?.limit || 5));
  const profile = await buildPreferenceProfile(userId);

  const hasAnySignal =
    profile.topCategories.length > 0 ||
    profile.topRegions.length > 0 ||
    profile.purposeKeywords.length > 0;

  if (!hasAnySignal) {
    return { profile, recommendations: [] };
  }

  const favoriteProgramIds = await prisma.favorite.findMany({
    where: { userId },
    select: { programId: true },
  });

  const regionOrClauses = profile.topRegions.map((region) => ({
    region: { contains: region, mode: "insensitive" as const },
  }));

  const keywordOrClauses = profile.purposeKeywords.flatMap((keyword) => [
    { title: { contains: keyword, mode: "insensitive" as const } },
    { summary: { contains: keyword, mode: "insensitive" as const } },
    { description: { contains: keyword, mode: "insensitive" as const } },
  ]);

  const programs = await prisma.program.findMany({
    where: {
      id: {
        notIn: favoriteProgramIds.map((favorite) => favorite.programId),
      },
      OR: [
        ...(profile.topCategories.length > 0
          ? [{ category: { in: profile.topCategories } }]
          : []),
        ...regionOrClauses,
        ...keywordOrClauses,
      ],
    },
    include: {
      images: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 60,
  });

  const ranked = programs
    .map((program) => scoreProgram(program, profile))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { profile, recommendations: ranked };
}

export async function sendPersonalizedRecommendationsIfOptedIn(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      marketingEmailOptIn: true,
      marketingAlimtalkOptIn: true,
    },
  });

  if (!user) return { success: false, reason: "user_not_found" as const };

  const { recommendations } = await getPersonalizedProgramRecommendations(userId, { limit: 3 });
  if (recommendations.length === 0) {
    return { success: true, emailSent: false, kakaoSent: false, reason: "no_recommendations" as const };
  }

  let emailSent = false;
  let kakaoSent = false;

  if (user.marketingEmailOptIn && user.email && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;">
        <h2 style="color:#2E6D45;">${user.name || "고객"}님 맞춤 프로그램 추천</h2>
        <p>최근 상담/관심 데이터를 바탕으로 아래 프로그램을 추천드려요.</p>
        <div style="line-height:1.8;">${formatRecommendationLines(recommendations)}</div>
        <p style="margin-top:20px;">원하시면 조건(인원/지역/예산)에 맞춰 더 정확한 맞춤 견적으로 이어서 도와드릴게요.</p>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "no-reply@touchtheworld.co.kr",
        to: user.email,
        subject: `[터치더월드] ${user.name || "고객"}님 맞춤 프로그램 추천`,
        html,
      });
      if (!result.error) {
        emailSent = true;
      } else {
        console.warn("개인화 추천 이메일 발송 실패:", result.error.message);
      }
    } catch (error) {
      console.warn("개인화 추천 이메일 발송 오류:", error);
    }
  }

  const recommendationTemplateCode =
    process.env.KAKAO_BM_RECOMMENDATION_TEMPLATE_CODE ||
    process.env.BIZM_RECOMMENDATION_TEMPLATE_CODE;
  if (
    user.marketingAlimtalkOptIn &&
    user.phone &&
    recommendationTemplateCode
  ) {
    const top1 = recommendations[0];
    try {
      const kakaoResult = await sendKakaoAlimtalk({
        phoneNumber: user.phone,
        templateCode: recommendationTemplateCode,
        message:
          "[터치더월드] 회원님 맞춤 프로그램 추천\n\n1순위: #{추천1}\n2순위: #{추천2}\n3순위: #{추천3}",
        variables: {
          추천1: recommendations[0]?.title || "-",
          추천2: recommendations[1]?.title || "-",
          추천3: recommendations[2]?.title || "-",
        },
        buttonUrl: top1 ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://touchtheworld.co.kr"}/programs/${top1.id}` : undefined,
        buttonText: "추천 프로그램 보기",
      });
      kakaoSent = kakaoResult.success;
      if (!kakaoResult.success) {
        console.warn("개인화 추천 알림톡 발송 실패:", kakaoResult.error);
      }
    } catch (error) {
      console.warn("개인화 추천 알림톡 발송 오류:", error);
    }
  }

  return { success: true, emailSent, kakaoSent };
}

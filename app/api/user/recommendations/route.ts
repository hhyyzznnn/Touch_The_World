import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import { getPersonalizedProgramRecommendations } from "@/lib/personalized-recommendations";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { profile, recommendations } = await getPersonalizedProgramRecommendations(user.id, {
      limit: 6,
    });

    return NextResponse.json({
      profile,
      recommendations,
    });
  } catch (error) {
    console.error("User recommendations error:", error);
    return NextResponse.json(
      { error: "개인화 추천을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-user";
import { buildFavoriteStatusMap, parseFavoriteProgramIds } from "@/lib/favorites";

export async function GET(request: NextRequest) {
  try {
    const programIds = parseFavoriteProgramIds(
      request.nextUrl.searchParams.get("ids")
    );

    if (programIds.length === 0) {
      return NextResponse.json({ likedByProgramId: {} });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        likedByProgramId: buildFavoriteStatusMap(programIds, []),
      });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
        programId: {
          in: programIds,
        },
      },
      select: {
        programId: true,
      },
    });

    return NextResponse.json({
      likedByProgramId: buildFavoriteStatusMap(
        programIds,
        favorites.map((favorite) => favorite.programId)
      ),
    });
  } catch (error) {
    console.error("Favorite batch lookup error:", error);
    return NextResponse.json({ likedByProgramId: {} });
  }
}

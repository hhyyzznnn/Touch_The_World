import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AchievementForm } from "@/components/AchievementForm";

async function getAchievement(id: string) {
  return await prisma.achievement.findUnique({
    where: { id },
  });
}

export default async function EditAchievementPage({
  params,
}: {
  params: { id: string };
}) {
  const achievement = await getAchievement(params.id);

  if (!achievement) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">사업 실적 수정</h1>
      <AchievementForm achievement={achievement} />
    </div>
  );
}


import { getCurrentUser } from "@/lib/auth-user";
import schoolsRaw from "@/lib/data/schools.json";

type School = { n: string; l: string; r: string | null };
const schools = schoolsRaw as School[];

function getSeasonActivity(month: number): string {
  if (month >= 3 && month <= 5) return "봄 체험학습";
  if (month >= 6 && month <= 8) return "여름방학 프로그램";
  if (month >= 9 && month <= 11) return "가을 수학여행";
  return "내년 교육여행";
}

function getLevelLabel(level: string): string {
  if (level === "초등학교") return "초등";
  if (level === "중학교") return "중학교";
  if (level === "특성화고") return "특성화고";
  return "고등학교";
}

export async function getPersonalizedGreeting(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user?.school) return null;

  const found = schools.find((s) => s.n === user.school!.trim());
  if (!found) return null;

  const month = new Date().getMonth() + 1;
  const activity = getSeasonActivity(month);
  const level = getLevelLabel(found.l);
  const regionPrefix = found.r ? `${found.r}, ` : "";

  return `${regionPrefix}${level}, ${activity} 지금 문의해보세요!`;
}

import { getCurrentUser } from "@/lib/auth-user";

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * 관리자 인증 시 AdminReadNotification 등에 사용할 admin User ID 반환
 * 현재 세션 사용자가 관리자일 때 해당 사용자 ID를 반환
 */
export async function getAdminUser(): Promise<{ id: string } | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return { id: user.id };
}

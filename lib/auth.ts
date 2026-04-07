import { getCurrentUser } from "@/lib/auth-user";

const STAFF_ROLES = new Set(["admin", "editor"] as const);

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function isStaff() {
  const user = await getCurrentUser();
  return Boolean(user?.role && STAFF_ROLES.has(user.role as "admin" | "editor"));
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

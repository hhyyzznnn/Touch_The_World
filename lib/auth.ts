import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function isAdmin() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin-auth");
  return auth?.value === "true";
}

/**
 * 관리자 인증 시 AdminReadNotification 등에 사용할 admin User ID 반환
 * admin-auth 쿠키가 있고, role=admin인 첫 번째 사용자 ID를 반환
 */
export async function getAdminUser(): Promise<{ id: string } | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin-auth");
  if (auth?.value !== "true") return null;

  const admin = await prisma.user.findFirst({
    where: { role: "admin" },
    select: { id: true },
  });
  return admin;
}


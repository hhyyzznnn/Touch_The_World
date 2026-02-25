import { prisma } from "@/lib/prisma";
import { getSessionPayloadFromCookies } from "@/lib/session-auth";

export async function getCurrentUser() {
  const session = await getSessionPayloadFromCookies();
  if (!session?.sub) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        school: true,
        role: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

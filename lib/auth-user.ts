import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user-id");
  
  if (!userId?.value) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId.value },
      select: {
        id: true,
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


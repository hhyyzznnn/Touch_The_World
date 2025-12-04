import { cookies } from "next/headers";

export async function isAdmin() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin-auth");
  return auth?.value === "true";
}


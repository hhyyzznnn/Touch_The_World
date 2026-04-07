import type { Metadata } from "next";
import { AdminNav } from "@/components/AdminNav";
import { getCurrentUser } from "@/lib/auth-user";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "관리자 | 터치더월드",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // /admin/login 은 인증 없이 접근 가능해야 하므로 리다이렉트/관리자 네비 적용 제외
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "editor")) {
    redirect("/admin/login");
  }

  const adminOnlyPrefixes = ["/admin/users", "/admin/inquiries"];
  if (
    user.role === "editor" &&
    adminOnlyPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav isAdmin={user.role === "admin"} />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
    </div>
  );
}

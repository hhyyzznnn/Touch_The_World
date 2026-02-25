import { AdminNav } from "@/components/AdminNav";
import { getCurrentUser } from "@/lib/auth-user";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
    </div>
  );
}

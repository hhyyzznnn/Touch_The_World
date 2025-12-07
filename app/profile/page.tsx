import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-user";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-medium mb-6">회원 정보</h1>
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}


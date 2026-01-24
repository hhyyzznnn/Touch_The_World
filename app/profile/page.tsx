import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth-user";
import { ProfileForm } from "@/components/ProfileForm";
import { UserStats } from "@/components/UserStats";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Star } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  // 검색 엔진 봇 확인
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isSearchEngineBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i.test(userAgent);

  if (!user) {
    // 검색 엔진 봇인 경우 robots.txt에서 이미 차단되므로 404 반환
    if (isSearchEngineBot) {
      notFound();
    }
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "회원 정보" }]} />
        
        {/* 회원 통계 및 활동 내역 */}
        <div className="mb-6">
          <UserStats userId={user.id} />
        </div>

        {/* 회원 정보 수정 */}
        <div className="bg-white rounded-lg shadow p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-medium">회원 정보</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/my-reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  내 후기
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/my-inquiries" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  문의 내역
                </Link>
              </Button>
            </div>
          </div>
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}


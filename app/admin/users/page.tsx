import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Shield, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      school: true,
      role: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      _count: {
        select: {
          reviews: true,
          favorites: true,
          consultingLogs: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: "사용자 관리" }]} />
        
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-medium">사용자 관리</h1>
            <div className="text-sm text-gray-500">
              총 {users.length}명
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 사용자가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      활동 내역
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-green-primary/10 flex items-center justify-center">
                            {user.role === "admin" ? (
                              <Shield className="w-5 h-5 text-brand-green-primary" />
                            ) : (
                              <UserCircle className="w-5 h-5 text-brand-green-primary" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.username || "아이디 없음"}
                            </div>
                            {user.school && (
                              <div className="text-xs text-gray-400 mt-1">
                                {user.school}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div>후기: {user._count.reviews}개</div>
                          <div>즐겨찾기: {user._count.favorites}개</div>
                          <div>상담: {user._count.consultingLogs}건</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <Badge
                            variant={user.role === "admin" ? "default" : "outline"}
                            className={
                              user.role === "admin"
                                ? "bg-brand-green-primary text-white"
                                : ""
                            }
                          >
                            {user.role === "admin" ? "관리자" : "일반"}
                          </Badge>
                          <div className="flex flex-col gap-1">
                            {user.emailVerified && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                이메일 인증
                              </Badge>
                            )}
                            {user.phoneVerified && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                전화 인증
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

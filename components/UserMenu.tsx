"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Mail, Star } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export function UserMenu() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = () => {
    // 클라이언트에서 사용자 정보 가져오기
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 경로 변경 시 사용자 정보 다시 가져오기
  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      // 전체 페이지 리로드하여 로그아웃 상태 즉시 반영
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/login">로그인</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">회원가입</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
      >
        <User className="w-5 h-5" />
        <span className="hidden lg:inline text-sm font-medium">{user.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                회원 정보
              </Link>
              <Link
                href="/my-reviews"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Star className="w-4 h-4" />
                내 후기
              </Link>
              <Link
                href="/my-inquiries"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Mail className="w-4 h-4" />
                문의 내역
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


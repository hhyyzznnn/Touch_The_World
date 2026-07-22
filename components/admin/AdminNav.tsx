"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { AdminNotification } from "@/components/admin/AdminNotification";

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Admin logout failed", error);
    }
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-24">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center h-16 sm:h-24">
              <Image
                src="/ttw_logo.png"
                alt="Touch The World"
                width={0}
                height={0}
                sizes="100vw"
                className="h-full w-auto object-contain"
                priority
              />
            </Link>
            <Link href="/admin" className="text-2xl sm:text-3xl font-medium text-brand-green-primary ml-2">
              관리자 대시보드
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/admin/programs"
              className="text-gray-700 hover:text-brand-green-primary transition text-base"
            >
              카드뉴스
            </Link>
            <Link
              href="/admin/events"
              className="text-gray-700 hover:text-brand-green-primary transition text-base"
            >
              진행 내역
            </Link>
            <Link
              href="/admin/calendar"
              className="text-gray-700 hover:text-brand-green-primary transition text-base"
            >
              캘린더
            </Link>
            {isAdmin && (
              <Link
                href="/admin/inquiries"
                className="text-gray-700 hover:text-brand-green-primary transition text-base"
              >
                문의
              </Link>
            )}
            <Link
              href="/admin/news"
              className="text-gray-700 hover:text-brand-green-primary transition text-base"
            >
              회사 소식
            </Link>
            {isAdmin && (
              <Link
                href="/admin/g2b"
                className="text-gray-700 hover:text-brand-green-primary transition text-base"
              >
                나라장터
              </Link>
            )}

            {/* 기타 기능 드롭다운 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-brand-green-primary transition text-base"
                aria-expanded={isMoreOpen}
              >
                기타 기능
                <ChevronDown className={`w-4 h-4 transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
              </button>
              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50 py-1">
                    <Link
                      href="/admin/documents"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green-primary transition"
                      onClick={() => setIsMoreOpen(false)}
                    >
                      자료실
                    </Link>
                    <Link
                      href="/admin/achievements"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green-primary transition"
                      onClick={() => setIsMoreOpen(false)}
                    >
                      사업실적
                    </Link>
                    <Link
                      href="/admin/clients"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green-primary transition"
                      onClick={() => setIsMoreOpen(false)}
                    >
                      고객사
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/users"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green-primary transition"
                        onClick={() => setIsMoreOpen(false)}
                      >
                        사용자
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {isAdmin && <AdminNotification />}
            <Button type="button" variant="outline" size="default" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-brand-green-primary transition"
            aria-label="메뉴"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/admin/programs"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                카드뉴스
              </Link>
              <Link
                href="/admin/events"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                진행 내역
              </Link>
              <Link
                href="/admin/calendar"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                캘린더
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/inquiries"
                  className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  문의
                </Link>
              )}
              <Link
                href="/admin/news"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                회사 소식
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/g2b"
                  className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  나라장터
                </Link>
              )}

              <div className="pt-2 mt-1 border-t">
                <p className="text-xs font-medium text-gray-400 pt-2 pb-1">기타 기능</p>
                <Link
                  href="/admin/documents"
                  className="text-gray-700 hover:text-brand-green-primary transition text-base py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  자료실
                </Link>
                <Link
                  href="/admin/achievements"
                  className="text-gray-700 hover:text-brand-green-primary transition text-base py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  사업실적
                </Link>
                <Link
                  href="/admin/clients"
                  className="text-gray-700 hover:text-brand-green-primary transition text-base py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  고객사
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    className="text-gray-700 hover:text-brand-green-primary transition text-base py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    사용자
                  </Link>
                )}
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

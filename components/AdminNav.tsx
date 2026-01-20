"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function AdminNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
              className="text-gray-700 hover:text-brand-green-primary transition text-base flex items-center justify-center h-10 px-3"
            >
              상품
            </Link>
            <Link
              href="/admin/events"
              className="text-gray-700 hover:text-brand-green-primary transition text-base flex items-center justify-center h-10 px-3"
            >
              진행 내역
            </Link>
            <Link
              href="/admin/inquiries"
              className="text-gray-700 hover:text-brand-green-primary transition text-base flex items-center justify-center h-10 px-3"
            >
              문의
            </Link>
            <Link
              href="/admin/documents"
              className="text-gray-700 hover:text-brand-green-primary transition text-base flex items-center justify-center h-10 px-3"
            >
              자료실
            </Link>
            <Link
              href="/admin/achievements"
              className="text-gray-700 hover:text-brand-green-primary transition text-base flex items-center justify-center h-10 px-3"
            >
              사업실적
            </Link>
            <Link
              href="/admin/clients"
              className="text-gray-700 hover:text-brand-green-primary transition text-base flex items-center justify-center h-10 px-3"
            >
              고객사
            </Link>
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
                상품
              </Link>
              <Link
                href="/admin/events"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                진행 내역
              </Link>
              <Link
                href="/admin/inquiries"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                문의
              </Link>
              <Link
                href="/admin/documents"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                자료실
              </Link>
              <Link
                href="/admin/achievements"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                사업실적
              </Link>
              <Link
                href="/admin/clients"
                className="text-gray-700 hover:text-brand-green-primary transition text-base py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                고객사
              </Link>
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


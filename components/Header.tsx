"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "./Logo";
import { PROGRAM_CATEGORIES, COMPANY_INFO } from "@/lib/constants";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { UserMenu } from "./UserMenu";
import { Menu, X, ChevronDown, Instagram, Facebook } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setIsProgramsOpen(false);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProgramsOpen(false);
  };

  if (isAdmin) {
    // 관리자 페이지에서는 상단 네비게이션을 숨김
    return null;
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16 sm:h-24 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
            <Logo />
            
            {/* 통합 검색 바 (데스크톱) */}
            <div className="hidden md:flex flex-1 max-w-md ml-2">
              <GlobalSearchBar />
            </div>
          </div>
          
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden xl:flex items-center gap-6 text-base font-medium">
            <Link
              href="/about"
              className="text-text-dark hover:text-brand-green hover:underline underline-offset-4 decoration-2 transition"
            >
              회사 소개
            </Link>
            <div className="relative group">
              <Link
                href="/programs"
                className="text-text-dark hover:text-brand-green hover:underline underline-offset-4 decoration-2 transition"
              >
                프로그램
              </Link>
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
                <div className="bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[200px]">
                  {PROGRAM_CATEGORIES.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-text-dark hover:text-brand-green hover:bg-gray-50 whitespace-nowrap"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/achievements"
              className="text-text-dark hover:text-brand-green hover:underline underline-offset-4 decoration-2 transition"
            >
              사업 실적
            </Link>
            <Link
              href="/inquiry"
              className="text-text-dark hover:text-brand-green hover:underline underline-offset-4 decoration-2 transition"
            >
              견적 문의
            </Link>
          </nav>

          {/* 사용자 메뉴 및 SNS 버튼 */}
          <div className="hidden xl:flex items-center ml-6 gap-3">
            {/* SNS 버튼 */}
            {(COMPANY_INFO.instagram || COMPANY_INFO.facebook) && (
              <div className="flex items-center gap-2">
                {COMPANY_INFO.instagram && (
                  <a
                    href={COMPANY_INFO.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {COMPANY_INFO.facebook && (
                  <a
                    href={COMPANY_INFO.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
            <UserMenu />
          </div>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <button
            onClick={toggleMenu}
            className="xl:hidden p-2 text-text-dark hover:text-brand-green transition"
            aria-label="메뉴 열기/닫기"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* 모바일 검색 바 */}
        <div className="md:hidden pb-3">
          <GlobalSearchBar />
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-1">
              <Link
                href="/about"
                onClick={closeMenu}
                className="px-4 py-3 text-text-dark hover:text-brand-green hover:bg-gray-50 rounded-lg transition font-medium"
              >
                회사 소개
              </Link>
              
              {/* 프로그램 드롭다운 */}
              <div>
                <button
                  onClick={() => setIsProgramsOpen(!isProgramsOpen)}
                  className="w-full px-4 py-3 text-text-dark hover:text-brand-green hover:bg-gray-50 rounded-lg transition font-medium flex items-center justify-between"
                >
                  프로그램
                  <ChevronDown className={`w-5 h-5 transition-transform ${isProgramsOpen ? "rotate-180" : ""}`} />
                </button>
                {isProgramsOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-brand-green/20 pl-4">
                    <Link
                      href="/programs"
                      onClick={closeMenu}
                      className="block px-4 py-2 text-sm text-text-gray hover:text-brand-green hover:bg-gray-50 rounded-lg transition"
                    >
                      전체 프로그램
                    </Link>
                    {PROGRAM_CATEGORIES.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMenu}
                        className="block px-4 py-2 text-sm text-text-gray hover:text-brand-green hover:bg-gray-50 rounded-lg transition"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link
                href="/achievements"
                onClick={closeMenu}
                className="px-4 py-3 text-text-dark hover:text-brand-green hover:bg-gray-50 rounded-lg transition font-medium"
              >
                사업 실적
              </Link>
              <Link
                href="/inquiry"
                onClick={closeMenu}
                className="px-4 py-3 text-text-dark hover:text-brand-green hover:bg-gray-50 rounded-lg transition font-medium"
              >
                견적 문의
              </Link>
            </div>
            
            {/* 모바일 사용자 메뉴 및 SNS 버튼 */}
            <div className="px-4 pt-4 border-t">
              {/* 모바일 SNS 버튼 */}
              {(COMPANY_INFO.instagram || COMPANY_INFO.facebook) && (
                <div className="flex items-center gap-2 mb-4">
                  {COMPANY_INFO.instagram && (
                    <a
                      href={COMPANY_INFO.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors"
                      aria-label="Instagram"
                      onClick={closeMenu}
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {COMPANY_INFO.facebook && (
                    <a
                      href={COMPANY_INFO.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors"
                      aria-label="Facebook"
                      onClick={closeMenu}
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
              <UserMenu />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

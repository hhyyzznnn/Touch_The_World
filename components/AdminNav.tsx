import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function AdminNav() {
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
            <Link href="/admin" className="text-2xl font-medium text-brand-green-primary ml-2">
              관리자 대시보드
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/programs"
              className="text-gray-700 hover:text-brand-green-primary transition"
            >
              상품
            </Link>
            <Link
              href="/admin/events"
              className="text-gray-700 hover:text-brand-green-primary transition"
            >
              진행 내역
            </Link>
            <Link
              href="/admin/inquiries"
              className="text-gray-700 hover:text-brand-green-primary transition"
            >
              문의
            </Link>
            <Link
              href="/admin/documents"
              className="text-gray-700 hover:text-brand-green-primary transition"
            >
              자료실
            </Link>
            <Link
              href="/admin/achievements"
              className="text-gray-700 hover:text-brand-green-primary transition"
            >
              사업실적
            </Link>
            <Link
              href="/admin/clients"
              className="text-gray-700 hover:text-brand-green-primary transition"
            >
              고객사
            </Link>
            <form action="/api/admin/logout" method="POST">
              <Button type="submit" variant="outline" size="sm">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}


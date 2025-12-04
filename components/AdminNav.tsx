import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin" className="text-xl font-bold text-primary">
            관리자 대시보드
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/programs"
              className="text-gray-700 hover:text-primary transition"
            >
              프로그램
            </Link>
            <Link
              href="/admin/events"
              className="text-gray-700 hover:text-primary transition"
            >
              행사
            </Link>
            <Link
              href="/admin/schools"
              className="text-gray-700 hover:text-primary transition"
            >
              학교
            </Link>
            <Link
              href="/admin/inquiries"
              className="text-gray-700 hover:text-primary transition"
            >
              문의
            </Link>
            <Link
              href="/admin/documents"
              className="text-gray-700 hover:text-primary transition"
            >
              자료실
            </Link>
            <Link
              href="/admin/achievements"
              className="text-gray-700 hover:text-primary transition"
            >
              사업실적
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


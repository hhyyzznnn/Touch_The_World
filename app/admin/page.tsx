import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getStats() {
  const [programs, events, schools, inquiries, documents] = await Promise.all([
    prisma.program.count(),
    prisma.event.count(),
    prisma.school.count(),
    prisma.inquiry.count({ where: { status: "pending" } }),
    prisma.document.count(),
  ]);

  return { programs, events, schools, inquiries, documents };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm text-gray-600 mb-2">프로그램</h3>
          <p className="text-3xl font-bold">{stats.programs}</p>
          <Button asChild variant="link" className="mt-4 p-0">
            <Link href="/admin/programs">관리하기 →</Link>
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm text-gray-600 mb-2">행사</h3>
          <p className="text-3xl font-bold">{stats.events}</p>
          <Button asChild variant="link" className="mt-4 p-0">
            <Link href="/admin/events">관리하기 →</Link>
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm text-gray-600 mb-2">학교</h3>
          <p className="text-3xl font-bold">{stats.schools}</p>
          <Button asChild variant="link" className="mt-4 p-0">
            <Link href="/admin/schools">관리하기 →</Link>
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm text-gray-600 mb-2">대기 중인 문의</h3>
          <p className="text-3xl font-bold">{stats.inquiries}</p>
          <Button asChild variant="link" className="mt-4 p-0">
            <Link href="/admin/inquiries">관리하기 →</Link>
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">빠른 링크</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Button asChild>
            <Link href="/admin/programs/new">새 프로그램 추가</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/events/new">새 행사 추가</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/schools/new">새 학교 추가</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/documents/new">새 자료 추가</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


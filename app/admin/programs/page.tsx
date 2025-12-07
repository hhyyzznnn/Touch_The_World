import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getPrograms() {
  return await prisma.program.findMany({
    include: {
      images: {
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminProgramsPage() {
  const [programs, products] = await Promise.all([
    getPrograms(),
    getProducts(),
  ]);

  const categoryLabels: Record<string, string> = {
    camp: "교육·학습 캠프",
    culture: "문화·예술·체험",
    sports: "스포츠 연계",
    study_abroad: "해외연수·유학",
    leadership: "리더십·인성",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">상품 관리</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/programs/new">새 상품 추가</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/products/new">새 상품 추가 (기존)</Link>
          </Button>
        </div>
      </div>

      {/* 상품 섹션 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">상품</h2>
        {programs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
            등록된 상품이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    이미지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {programs.map((program) => (
                  <tr key={program.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{program.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{program.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {program.images.length}개
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/programs/${program.id}/edit`}>
                            수정
                          </Link>
                        </Button>
                        <form
                          action={`/api/admin/programs/${program.id}`}
                          method="DELETE"
                        >
                          <Button type="submit" variant="destructive" size="sm">
                            삭제
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* 상품 섹션 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">상품</h2>
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
            등록된 상품이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    지역
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{product.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {categoryLabels[product.category] || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {product.region || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            수정
                          </Link>
                        </Button>
                        <form
                          action={`/api/admin/products/${product.id}`}
                          method="DELETE"
                        >
                          <Button type="submit" variant="destructive" size="sm">
                            삭제
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


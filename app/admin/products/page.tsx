import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  const categoryLabels: Record<string, string> = {
    camp: "교육·학습 캠프",
    culture: "문화·예술·체험",
    sports: "스포츠 연계",
    study_abroad: "해외연수·유학",
    leadership: "리더십·인성",
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">상품 관리</h1>
          <Button asChild>
            <Link href="/admin/products/new">새 상품 추가</Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            등록된 상품이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
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
        )}
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";

const ITEMS_PER_PAGE = 10;

async function getDocuments(category?: string, page: number = 1) {
  const where = category ? { category } : {};
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.document.count({ where }),
  ]);
  
  return {
    documents,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  };
}

async function getCategories() {
  const documents = await prisma.document.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return documents.map((d) => d.category);
}

// 페이지 재검증 시간 설정 (10분)
export const revalidate = 600;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;
  const { documents, totalPages } = await getDocuments(params.category, currentPage);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">자료실</h1>
        <p className="text-text-gray mb-6">
          공문 템플릿, 안내문, 안전 매뉴얼 등 필요한 자료를 다운로드하세요.
        </p>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant={!params.category ? "default" : "outline"}
              className={!params.category ? "bg-brand-green-primary hover:bg-brand-green-primary/90 text-white" : "bg-white border-gray-300 text-text-dark hover:border-brand-green-primary hover:bg-brand-green-primary/5"}
            >
              <Link href="/documents">전체</Link>
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                asChild
                variant={params.category === category ? "default" : "outline"}
                className={params.category === category ? "bg-brand-green-primary hover:bg-brand-green-primary/90 text-white" : "bg-white border-gray-300 text-text-dark hover:border-brand-green-primary hover:bg-brand-green-primary/5"}
              >
                <Link href={`/documents?category=${encodeURIComponent(category)}`}>
                  {category}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-text-gray">
          등록된 자료가 없습니다.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-brand-green-primary bg-brand-green-primary/10 px-3 py-1 rounded-full">
                        {document.category}
                      </span>
                      <span className="text-sm text-text-gray">
                        {format(new Date(document.createdAt), "yyyy년 MM월 dd일")}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{document.title}</h3>
                  </div>
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 bg-brand-green-primary text-white rounded-md hover:bg-brand-green-primary/90 transition"
                  >
                    다운로드
                  </a>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/documents"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}


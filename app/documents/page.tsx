import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

async function getDocuments(category?: string) {
  const where = category ? { category } : {};
  return await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  const documents = await prisma.document.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return documents.map((d) => d.category);
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const documents = await getDocuments(searchParams.category);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">자료실</h1>
        <p className="text-gray-600 mb-6">
          공문 템플릿, 안내문, 안전 매뉴얼 등 필요한 자료를 다운로드하세요.
        </p>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <a
              href="/documents"
              className={`px-4 py-2 rounded-md text-sm ${
                !searchParams.category
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체
            </a>
            {categories.map((category) => (
              <a
                key={category}
                href={`/documents?category=${encodeURIComponent(category)}`}
                className={`px-4 py-2 rounded-md text-sm ${
                  searchParams.category === category
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </a>
            ))}
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 자료가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {document.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(document.createdAt), "yyyy년 MM월 dd일")}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{document.title}</h3>
                </div>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                >
                  다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CompanyNewsForm } from "@/components/CompanyNewsForm";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.companyNews.findUnique({ where: { id } });
  if (!news) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">회사 소식 수정</h1>
      <CompanyNewsForm news={news} />
    </div>
  );
}

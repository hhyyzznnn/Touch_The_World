import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/AdminNav";
import { ProductForm } from "@/components/ProductForm";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
  return await prisma.product.findUnique({
    where: { id },
  });
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">상품 수정</h1>
        <ProductForm product={product} />
      </div>
    </div>
  );
}


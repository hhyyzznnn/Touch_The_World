import { AdminNav } from "@/components/AdminNav";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">새 상품 추가</h1>
        <ProductForm />
      </div>
    </div>
  );
}


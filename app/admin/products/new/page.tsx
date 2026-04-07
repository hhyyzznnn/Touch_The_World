import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="py-2">
      <h1 className="text-3xl font-bold mb-8">새 상품 추가</h1>
      <ProductForm />
    </div>
  );
}

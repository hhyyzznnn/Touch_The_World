import { AdminNav } from "@/components/AdminNav";
import { ClientForm } from "@/components/ClientForm";

export default function NewClientPage() {
  return (
    <div>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">새 고객사 추가</h1>
        <ClientForm />
      </div>
    </div>
  );
}


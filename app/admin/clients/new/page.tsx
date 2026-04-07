import { ClientForm } from "@/components/ClientForm";

export default function NewClientPage() {
  return (
    <div className="py-2">
      <h1 className="text-3xl font-bold mb-8">새 고객사 추가</h1>
      <ClientForm />
    </div>
  );
}

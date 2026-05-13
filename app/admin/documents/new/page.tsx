import { DocumentForm } from "@/components/forms/DocumentForm";

export default function NewDocumentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">새 자료 추가</h1>
      <DocumentForm />
    </div>
  );
}

